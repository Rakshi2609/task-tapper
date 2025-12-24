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
              Manage Tasks, Build Communities
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Task Tapper empowers teams to organize work through communities, departments, and collaborative task management. Create, assign, and track tasks with your team—all in one place.
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
                <li className="flex items-center gap-2"><FaUserShield className="text-purple-600"/> Create and join communities with departments</li>
                <li className="flex items-center gap-2"><FaClipboardList className="text-blue-600"/> Department-based task organization and tracking</li>
                <li className="flex items-center gap-2"><FaSyncAlt className="text-green-600"/> Recurring tasks with flexible schedules</li>
                <li className="flex items-center gap-2"><FaCalendarCheck className="text-indigo-600"/> Assign tasks to community members</li>
                <li className="flex items-center gap-2"><FaComments className="text-amber-600"/> Real-time World Chat for team coordination</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">How it works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Step number={1} title="Create your account" desc="Sign up with email and complete your profile to get started." />
          <Step number={2} title="Join or create communities" desc="Create your own community or apply to join existing ones." />
          <Step number={3} title="Set up departments" desc="Organize work by creating departments within your communities." />
          <Step number={4} title="Create & assign tasks" desc="Add tasks to departments and assign them to community members." />
          <Step number={5} title="Track progress" desc="Monitor task updates, completion status, and team productivity." />
          <Step number={6} title="Collaborate" desc="Use World Chat and task updates to keep everyone aligned." />
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Roles & Permissions</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
              <li><strong>Community Owner:</strong> Creates communities, manages departments, approves/rejects join requests, assigns tasks to any member.</li>
              <li><strong>Community Member:</strong> Creates departments, creates and receives tasks, tracks progress, and collaborates with team.</li>
              <li><strong>Applicant:</strong> Can apply to join communities and will be notified upon approval or rejection.</li>
              <li>Protected routes ensure only authenticated users access work features.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Community Task Flow</h3>
            <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
              <li>Create or join a community</li>
              <li>Set up departments to organize different work areas</li>
              <li>Create tasks within departments (one-time or recurring)</li>
              <li>Assign tasks to community members by email</li>
              <li>Track progress through task updates and completion status</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Key features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature icon={<FaUserShield />} title="Communities" desc="Create communities and organize teams with approval workflows." />
          <Feature icon={<FaClipboardList />} title="Department Tasks" desc="Organize tasks by department for better structure and clarity." />
          <Feature icon={<FaSyncAlt />} title="Recurring Tasks" desc="Automate routine work with daily, weekly, or monthly schedules." />
          <Feature icon={<FaCalendarCheck />} title="Team Collaboration" desc="Assign tasks to members and track progress together." />
          <Feature icon={<FaCheckCircle />} title="Progress Tracking" desc="Monitor completion status and review task history." />
          <Feature icon={<FaComments />} title="World Chat" desc="Real-time communication for quick updates and coordination." />
        </div>
      </section>

      {/* Recurring tasks details */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Communities & Departments</h3>
          <ul className="list-disc ml-6 mt-3 space-y-1 text-gray-700 text-sm">
            <li>Create communities to bring teams together or join existing ones with owner approval.</li>
            <li>Organize work with departments—both owners and members can create them.</li>
            <li>Assign tasks within departments to keep work structured and trackable.</li>
            <li>View all your communities on your profile with task counts assigned to you.</li>
          </ul>
        </div>
      </section>

      {/* Quick links & Quick start */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Quick start checklist</h3>
          <ol className="list-decimal ml-6 mt-3 space-y-1 text-gray-700">
            <li>Sign up and complete your profile</li>
            <li>Create your first community or apply to join existing ones</li>
            <li>Set up departments to organize your work</li>
            <li>Create tasks (one-time or recurring) and assign to members</li>
            <li>Track your tasks and communities from your dashboard</li>
            <li>Use World Chat to coordinate with your team in real-time</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow">
              <FaBolt /> Log in
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl shadow-sm">
              Create account
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Dashboard
            </Link>
            <Link to="/communities" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Communities
            </Link>
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Your tasks
            </Link>
            <Link to="/recurring/list" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-3">
              Recurring tasks
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
        <span>© {new Date().getFullYear()} Task Tapper. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Landing;
