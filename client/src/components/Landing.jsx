import React from "react";
import { Link } from "react-router-dom";
import { FaBolt, FaCalendarCheck, FaSyncAlt, FaClipboardList, FaComments, FaUserShield, FaCheckCircle } from "react-icons/fa";

const Step = ({ number, title, desc }) => (
  <div className="flex items-start gap-4">
    <div className="flex-none w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
      {number}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  </div>
);

const Feature = ({ icon, title, desc }) => (
  <div className="p-5 rounded-2xl bg-white shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
    <div className="text-2xl text-blue-600 mb-3">{icon}</div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Tap your tasks into shape
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Donezo helps you create one‑time and recurring tasks, assign work, track progress, and chat with your team—all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow">
                <FaBolt /> Get Started
              </Link>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl shadow-sm">
                Create an Account
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
                View Dashboard
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-white/70 backdrop-blur border border-blue-100 shadow-xl p-6">
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2"><FaCalendarCheck className="text-green-600"/> Plan one‑time tasks with due dates and priorities</li>
                <li className="flex items-center gap-2"><FaSyncAlt className="text-purple-600"/> Schedule recurring tasks (daily/weekly/monthly)</li>
                <li className="flex items-center gap-2"><FaClipboardList className="text-blue-600"/> Assign work and track what you’ve assigned</li>
                <li className="flex items-center gap-2"><FaComments className="text-indigo-600"/> Chat in World Chat to coordinate quickly</li>
                <li className="flex items-center gap-2"><FaUserShield className="text-amber-600"/> Your data stays private to your team</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">How it works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Step number={1} title="Sign up or Log in" desc="Create an account or log in with your email to get started." />
          <Step number={2} title="Complete your profile" desc="Add phone and role to personalize your experience." />
          <Step number={3} title="Create tasks" desc="Add one‑time tasks or set up recurring ones with flexible schedules." />
          <Step number={4} title="Assign & accept" desc="Assign tasks to teammates. Assignees can accept and start working." />
          <Step number={5} title="Update & complete" desc="Post updates, mark done, and review history in task details." />
          <Step number={6} title="Collaborate in chat" desc="Use World Chat for quick announcements and coordination." />
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Roles & Permissions</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
              <li><strong>Assigner:</strong> Creates tasks, sets due dates/frequency, assigns to teammates, and can track what they assigned in “Assigned by Me”.</li>
              <li><strong>Assignee:</strong> Accepts tasks, posts updates, completes tasks. Everyone can view their own tasks in “Your Tasks”.</li>
              <li>Routes are protected—only logged‑in users can access work pages.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Task lifecycle</h3>
            <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
              <li>Create task (title, description, due date, priority)</li>
              <li>Assign by email (assignee will see it in “Your Tasks”)</li>
              <li>Assignee accepts and can add updates in the Task Detail</li>
              <li>Mark completed when done (auto‑moves to Completed)</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Key features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature icon={<FaCalendarCheck />} title="One‑time Tasks" desc="Create tasks with due dates, priorities, and details." />
          <Feature icon={<FaSyncAlt />} title="Recurring Tasks" desc="Automate routines with daily, weekly, or monthly repeats." />
          <Feature icon={<FaClipboardList />} title="Assigned by Me" desc="See everything you’ve assigned and their statuses." />
          <Feature icon={<FaComments />} title="World Chat" desc="Broadcast updates and collaborate in real time." />
          <Feature icon={<FaUserShield />} title="Protected Routes" desc="Only logged‑in users can access work pages." />
          <Feature icon={<FaCheckCircle />} title="Quick Actions" desc="Accept, update, and complete tasks in a click." />
        </div>
      </section>

      {/* Recurring tasks details */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Recurring tasks</h3>
          <ul className="list-disc ml-6 mt-3 space-y-1 text-gray-700 text-sm">
            <li>Choose frequency (Daily / Weekly / Monthly) and start/end dates.</li>
            <li>They appear in the Recurring list; you can complete or delete each.</li>
            <li>Use the detail page to track updates or comments over time.</li>
          </ul>
        </div>
      </section>

      {/* Quick links & Quick start */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Quick start checklist</h3>
          <ol className="list-decimal ml-6 mt-3 space-y-1 text-gray-700">
            <li>Create an account and log in</li>
            <li>Open Dashboard to view your tasks</li>
            <li>Create a one‑time task or set a recurring task</li>
            <li>Assign tasks to teammates (by email)</li>
            <li>Use the sidebar to navigate Tasks, Recurring, My Work, and Chat</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow">
              <FaBolt /> Log in
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl shadow-sm">
              Create account
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Go to dashboard
            </Link>
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Your tasks
            </Link>
            <Link to="/recurring/list" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Recurring tasks
            </Link>
            <Link to="/mywork" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Assigned by me
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              World Chat
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-1">Why can’t I access Tasks directly?</h4>
            <p className="text-gray-700">Work pages are protected. Please log in first; after that, you can access Tasks, Recurring, My Work, and Chat.</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-1">How do I see only completed tasks?</h4>
            <p className="text-gray-700">In “Your Tasks”, use the Show Completed toggle to switch between pending and completed lists.</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-1">How do I view older messages in World Chat?</h4>
            <p className="text-gray-700">Scroll to the top and use “Load older messages” to fetch older batches of 20 messages.</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-1">I can’t see the sidebar on mobile—what do I do?</h4>
            <p className="text-gray-700">Use the hamburger button in the top navbar to open/close the sidebar. It also works on desktop.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-8">
        <span>© {new Date().getFullYear()} Donezo. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Landing;
