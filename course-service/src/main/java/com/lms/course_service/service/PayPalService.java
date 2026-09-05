package com.lms.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.course_service.config.PayPalConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final PayPalConfig payPalConfig;

    private final RestClient restClient =
            RestClient.builder().build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    // =========================================================
    // GET PAYPAL ACCESS TOKEN
    // =========================================================

    public String getAccessToken() {

        String response =
                restClient
                        .post()
                        .uri(
                                payPalConfig.getBaseUrl()
                                        + "/v1/oauth2/token"
                        )
                        .headers(headers -> {

                            headers.setBasicAuth(
                                    payPalConfig.getClientId(),
                                    payPalConfig.getClientSecret()
                            );

                            headers.setContentType(
                                    MediaType.APPLICATION_FORM_URLENCODED
                            );

                            headers.setAccept(
                                    List.of(
                                            MediaType.APPLICATION_JSON
                                    )
                            );
                        })
                        .body(
                                "grant_type=client_credentials"
                        )
                        .retrieve()
                        .body(String.class);

        if (response == null
                || response.isBlank()) {

            throw new IllegalStateException(
                    "PayPal did not return an access token"
            );
        }

        return extractAccessToken(response);
    }

    // =========================================================
    // CREATE PAYPAL ORDER
    // =========================================================

    public Map<String, Object> createOrder(
            Double amount,
            String courseId
    ) {

        String accessToken =
                getAccessToken();

        String requestId =
                UUID.randomUUID().toString();

        Map<String, Object> purchaseUnit =
                new HashMap<>();

        purchaseUnit.put(
                "reference_id",
                courseId
        );

        purchaseUnit.put(
                "description",
                "LMS Course - " + courseId
        );

        purchaseUnit.put(
                "amount",
                Map.of(
                        "currency_code",
                        "USD",
                        "value",
                        String.format(
                                "%.2f",
                                amount/90
                        )
                )
        );

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "intent",
                "CAPTURE"
        );

        requestBody.put(
                "purchase_units",
                List.of(purchaseUnit)
        );

        requestBody.put(
                "payment_source",
                Map.of(
                        "paypal",
                        Map.of(
                                "experience_context",
                                Map.of(
                                        "user_action",
                                        "PAY_NOW",
                                        "return_url",
                                        "http://localhost:5173/payment/success",
                                        "cancel_url",
                                        "http://localhost:5173/payment/cancel"
                                )
                        )
                )
        );

        String response =
                restClient
                        .post()
                        .uri(
                                payPalConfig.getBaseUrl()
                                        + "/v2/checkout/orders"
                        )
                        .headers(headers -> {

                            headers.setBearerAuth(
                                    accessToken
                            );

                            headers.setContentType(
                                    MediaType.APPLICATION_JSON
                            );

                            headers.setAccept(
                                    List.of(
                                            MediaType.APPLICATION_JSON
                                    )
                            );

                            headers.set(
                                    "PayPal-Request-Id",
                                    requestId
                            );
                        })
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);

        if (response == null
                || response.isBlank()) {

            throw new IllegalStateException(
                    "PayPal did not return an order"
            );
        }

        return parseOrderResponse(response);
    }

    // =========================================================
    // CAPTURE PAYPAL ORDER
    // =========================================================

    public Map<String, Object> captureOrder(
            String orderId
    ) {

        String accessToken =
                getAccessToken();

        String requestId =
                UUID.randomUUID().toString();

        try {

            String response =
                    restClient
                            .post()
                            .uri(
                                    payPalConfig.getBaseUrl()
                                            + "/v2/checkout/orders/"
                                            + orderId
                                            + "/capture"
                            )
                            .headers(headers -> {

                                headers.setBearerAuth(
                                        accessToken
                                );

                                headers.setContentType(
                                        MediaType.APPLICATION_JSON
                                );

                                headers.setAccept(
                                        List.of(
                                                MediaType.APPLICATION_JSON
                                        )
                                );

                                headers.set(
                                        "PayPal-Request-Id",
                                        requestId
                                );
                            })
                            .body("{}")
                            .retrieve()
                            .body(String.class);

            if (response == null
                    || response.isBlank()) {

                throw new IllegalStateException(
                        "PayPal did not return a capture response"
                );
            }

            return parseCaptureResponse(response);

        } catch (HttpClientErrorException ex) {

            /*
             * PayPal returns HTTP 422 with
             * ORDER_ALREADY_CAPTURED when another request
             * already captured this order.
             *
             * In that situation the payment is NOT failed.
             *
             * We retrieve the order details and use the
             * existing completed capture.
             */
            if (isOrderAlreadyCaptured(ex)) {

                return getCompletedOrderDetails(
                        orderId,
                        accessToken
                );
            }

            throw ex;
        }
    }

    // =========================================================
    // GET PAYPAL ORDER DETAILS
    // =========================================================

    public Map<String, Object> getCompletedOrderDetails(
            String orderId,
            String accessToken
    ) {

        String response =
                restClient
                        .get()
                        .uri(
                                payPalConfig.getBaseUrl()
                                        + "/v2/checkout/orders/"
                                        + orderId
                        )
                        .headers(headers -> {

                            headers.setBearerAuth(
                                    accessToken
                            );

                            headers.setAccept(
                                    List.of(
                                            MediaType.APPLICATION_JSON
                                    )
                            );
                        })
                        .retrieve()
                        .body(String.class);

        if (response == null
                || response.isBlank()) {

            throw new IllegalStateException(
                    "PayPal did not return order details"
            );
        }

        return parseCompletedOrderResponse(
                response
        );
    }

    // =========================================================
    // CHECK ORDER_ALREADY_CAPTURED
    // =========================================================

    private boolean isOrderAlreadyCaptured(
            HttpClientErrorException ex
    ) {

        if (ex.getStatusCode()
                != HttpStatusCode.valueOf(422)) {

            return false;
        }

        String responseBody =
                ex.getResponseBodyAsString();

        return responseBody != null
                && responseBody.contains(
                "ORDER_ALREADY_CAPTURED"
        );
    }

    // =========================================================
    // PARSE COMPLETED ORDER
    // =========================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object>
    parseCompletedOrderResponse(
            String response
    ) {

        try {

            Map<String, Object> responseMap =
                    objectMapper.readValue(
                            response,
                            new TypeReference<
                                    Map<String, Object>
                                    >() {}
                    );

            String orderId =
                    (String) responseMap.get("id");

            String status =
                    (String) responseMap.get("status");

            String captureId = null;

            List<Map<String, Object>> purchaseUnits =
                    (List<Map<String, Object>>)
                            responseMap.get(
                                    "purchase_units"
                            );

            if (purchaseUnits != null
                    && !purchaseUnits.isEmpty()) {

                Map<String, Object>
                        firstPurchaseUnit =
                        purchaseUnits.get(0);

                Map<String, Object> payments =
                        (Map<String, Object>)
                                firstPurchaseUnit.get(
                                        "payments"
                                );

                if (payments != null) {

                    List<Map<String, Object>>
                            captures =
                            (List<Map<String, Object>>)
                                    payments.get(
                                            "captures"
                                    );

                    if (captures != null
                            && !captures.isEmpty()) {

                        captureId =
                                (String)
                                        captures
                                                .get(0)
                                                .get("id");
                    }
                }
            }

            if (orderId == null
                    || orderId.isBlank()) {

                throw new IllegalStateException(
                        "PayPal order ID was not returned"
                );
            }

            if (!"COMPLETED".equalsIgnoreCase(status)) {

                throw new IllegalStateException(
                        "PayPal order is not completed. Current status: "
                                + status
                );
            }

            return Map.of(
                    "orderId",
                    orderId,
                    "status",
                    status,
                    "captureId",
                    captureId != null
                            ? captureId
                            : ""
            );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed to parse completed PayPal order response",
                    ex
            );
        }
    }

    // =========================================================
    // EXTRACT ACCESS TOKEN
    // =========================================================

    private String extractAccessToken(
            String response
    ) {

        try {

            Map<String, Object> responseMap =
                    objectMapper.readValue(
                            response,
                            new TypeReference<
                                    Map<String, Object>
                                    >() {}
                    );

            Object accessToken =
                    responseMap.get(
                            "access_token"
                    );

            if (accessToken == null) {

                throw new IllegalStateException(
                        "PayPal access token was not present in the response"
                );
            }

            return accessToken.toString();

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed to parse PayPal OAuth response",
                    ex
            );
        }
    }

    // =========================================================
    // PARSE CREATE ORDER RESPONSE
    // =========================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object>
    parseOrderResponse(
            String response
    ) {

        try {

            Map<String, Object> responseMap =
                    objectMapper.readValue(
                            response,
                            new TypeReference<
                                    Map<String, Object>
                                    >() {}
                    );

            String orderId =
                    (String) responseMap.get("id");

            String status =
                    (String) responseMap.get("status");

            String approvalUrl = null;

            List<Map<String, Object>> links =
                    (List<Map<String, Object>>)
                            responseMap.get(
                                    "links"
                            );

            if (links != null) {

                for (
                        Map<String, Object> link
                        : links
                ) {

                    String rel =
                            (String)
                                    link.get("rel");

                    if (
                            "payer-action".equals(rel)
                                    || "approve".equals(rel)
                    ) {

                        approvalUrl =
                                (String)
                                        link.get("href");

                        break;
                    }
                }
            }

            if (orderId == null
                    || orderId.isBlank()) {

                throw new IllegalStateException(
                        "PayPal order ID was not returned"
                );
            }

            return Map.of(
                    "orderId",
                    orderId,
                    "status",
                    status != null
                            ? status
                            : "CREATED",
                    "approvalUrl",
                    approvalUrl != null
                            ? approvalUrl
                            : ""
            );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed to parse PayPal order response",
                    ex
            );
        }
    }

    // =========================================================
    // PARSE CAPTURE RESPONSE
    // =========================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object>
    parseCaptureResponse(
            String response
    ) {

        try {

            Map<String, Object> responseMap =
                    objectMapper.readValue(
                            response,
                            new TypeReference<
                                    Map<String, Object>
                                    >() {}
                    );

            String orderId =
                    (String) responseMap.get("id");

            String status =
                    (String) responseMap.get("status");

            String captureId = null;

            List<Map<String, Object>>
                    purchaseUnits =
                    (List<Map<String, Object>>)
                            responseMap.get(
                                    "purchase_units"
                            );

            if (purchaseUnits != null
                    && !purchaseUnits.isEmpty()) {

                Map<String, Object>
                        firstPurchaseUnit =
                        purchaseUnits.get(0);

                Map<String, Object> payments =
                        (Map<String, Object>)
                                firstPurchaseUnit.get(
                                        "payments"
                                );

                if (payments != null) {

                    List<Map<String, Object>>
                            captures =
                            (List<Map<String, Object>>)
                                    payments.get(
                                            "captures"
                                    );

                    if (captures != null
                            && !captures.isEmpty()) {

                        captureId =
                                (String)
                                        captures
                                                .get(0)
                                                .get("id");
                    }
                }
            }

            if (orderId == null
                    || orderId.isBlank()) {

                throw new IllegalStateException(
                        "PayPal order ID was not returned"
                );
            }

            return Map.of(
                    "orderId",
                    orderId,
                    "status",
                    status != null
                            ? status
                            : "",
                    "captureId",
                    captureId != null
                            ? captureId
                            : ""
            );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed to parse PayPal capture response",
                    ex
            );
        }
    }
}