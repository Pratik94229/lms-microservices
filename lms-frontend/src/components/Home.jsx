function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-secondary">
        <div className="mx-auto flex min-h-[520px] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              Learn. Build. Grow.
            </p>

            <h1 className="text-4xl font-bold leading-tight text-dark sm:text-5xl md:text-6xl">
              Learn New Skills.
              <br />
              Build Your Future.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Learn practical skills from quality courses and improve your
              knowledge with our simple and flexible learning platform.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-3 shadow-md sm:flex-row">
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="h-12 flex-1 rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-primary"
              />

              <button className="h-12 rounded-lg bg-primary px-7 text-sm font-semibold text-white transition hover:opacity-90">
                Search Courses
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
              <div>
                <p className="text-xl font-bold text-dark">100+</p>
                <p className="text-muted">Courses</p>
              </div>

              <div>
                <p className="text-xl font-bold text-dark">1,000+</p>
                <p className="text-muted">Students</p>
              </div>

              <div>
                <p className="text-xl font-bold text-dark">50+</p>
                <p className="text-muted">Instructors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why choose LMS?
          </p>

          <h2 className="mt-2 text-3xl font-bold text-dark">
            Everything you need to learn
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Discover courses, learn at your own pace, track your progress,
            complete quizzes, and keep improving your skills.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-xl">
                📚
              </div>

              <h3 className="mt-4 text-lg font-semibold text-dark">
                Quality Courses
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                Learn from structured courses created by instructors.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-xl">
                📈
              </div>

              <h3 className="mt-4 text-lg font-semibold text-dark">
                Track Progress
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                Track completed lessons and monitor your course progress.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-xl">
                📝
              </div>

              <h3 className="mt-4 text-lg font-semibold text-dark">
                Practice With Quizzes
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                Test your understanding with quizzes and track your results.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
