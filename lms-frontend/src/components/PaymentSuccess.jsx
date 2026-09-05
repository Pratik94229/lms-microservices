import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

/*
 * Keeps an in-progress capture request alive even if
 * React StrictMode temporarily remounts the component.
 *
 * Key = PayPal order ID
 * Value = Promise for the capture request
 */
const captureRequests = new Map();

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const orderId = searchParams.get("token");

    if (!orderId) {
      setStatus("error");
      setMessage("PayPal order ID was not found.");
      return;
    }

    /*
     * If this exact PayPal order was already successfully
     * captured in this browser session, don't call the
     * backend again.
     */
    const completedKey = `paypal-payment-completed-${orderId}`;

    if (sessionStorage.getItem(completedKey) === "true") {
      setStatus("success");
      setMessage("Payment successful! You are now enrolled in the course.");
      return;
    }

    const capturePayment = async () => {
      try {
        setStatus("processing");
        setMessage("Confirming your payment...");

        const response = await api.post("/payments/capture", {
          orderId,
        });

        console.log("Payment captured successfully:", response.data);

        /*
         * Remember that this PayPal order has already
         * been processed successfully.
         */
        sessionStorage.setItem(completedKey, "true");

        setStatus("success");
        setMessage("Payment successful! You are now enrolled in the course.");
      } catch (error) {
        console.error("Payment capture failed:", error);

        const errorMessage = error.response?.data?.message || "";

        const errorText =
          typeof error.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error.response?.data || "");

        const alreadyCaptured =
          errorMessage.toLowerCase().includes("already captured") ||
          errorText.toLowerCase().includes("order_already_captured");

        /*
         * PayPal may report that the order was already
         * captured. This should be treated as success,
         * not as a payment failure.
         */
        if (alreadyCaptured) {
          sessionStorage.setItem(completedKey, "true");

          setStatus("success");
          setMessage(
            "Payment was already completed. Your course access has been confirmed.",
          );

          return;
        }

        setStatus("error");

        setMessage(errorMessage || "Payment could not be completed.");
      }
    };

    /*
     * IMPORTANT:
     *
     * If StrictMode causes this effect to run again,
     * reuse the SAME Promise instead of sending another
     * POST request.
     */
    if (!captureRequests.has(orderId)) {
      const request = capturePayment();

      captureRequests.set(orderId, request);
    }

    const request = captureRequests.get(orderId);

    request.catch(() => {
      /*
       * Allow a retry if the request actually failed.
       */
      captureRequests.delete(orderId);
    });
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === "processing" && (
          <>
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>

            <h1 className="text-2xl font-bold text-gray-900">
              Processing Payment
            </h1>

            <p className="mt-3 text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Payment Successful
            </h1>

            <p className="mt-3 text-gray-600">{message}</p>

            <button
              type="button"
              onClick={() => navigate("/my-learning")}
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Go to My Learning
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
              !
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Payment Problem
            </h1>

            <p className="mt-3 break-words text-red-600">{message}</p>

            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="mt-6 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-900"
            >
              Back to Courses
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
