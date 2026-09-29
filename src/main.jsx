import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Wallet,
  Send,
  PlusCircle,
  ArrowDownToLine,
  ArrowUpRight,
  History,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";
import "./index.css";

const money = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(n) || 0);

const seed = {
  users: [
    {
      id: "u1",
      name: "Demo User",
      email: "demo@quickpay.test",
      password: "demo1234",
      pin: "1234",
      role: "admin",
      balance: 25000,
    },
  ],
  tx: [
    {
      id: 1,
      user: "u1",
      type: "funding",
      amount: 25000,
      status: "success",
      note: "Demo opening balance",
      date: new Date().toISOString(),
    },
  ],
};

function load() {
  try {
    const saved = localStorage.getItem("qpdb");
    return saved ? JSON.parse(saved) : seed;
  } catch {
    return seed;
  }
}

function save(data) {
  localStorage.setItem("qpdb", JSON.stringify(data));
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "demo@quickpay.test",
    password: "demo1234",
  });

  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    const data = load();
    const email = form.email.trim().toLowerCase();

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (data.users.some((u) => u.email === email)) {
        setError("Email already exists.");
        return;
      }

      const newUser = {
        id: "u" + Date.now(),
        name: form.name.trim(),
        email,
        password: form.password,
        pin: null,
        role: "user",
        balance: 0,
      };

      data.users.push(newUser);
      save(data);

      localStorage.setItem("qpuser", JSON.stringify(newUser));
      onLogin(newUser);
      return;
    }

    const user = data.users.find(
      (u) => u.email === email && u.password === form.password
    );

    if (!user) {
      setError(
        "Invalid login. Try demo@quickpay.test / demo1234"
      );
      return;
    }

    localStorage.setItem("qpuser", JSON.stringify(user));
    onLogin(user);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-5">
          <Wallet />
        </div>

        <h1 className="text-3xl font-black">QuickPay</h1>

        <p className="text-slate-500 mt-1 mb-7">
          Mini fintech wallet — demonstration edition
        </p>

        {mode === "register" && (
          <input
            required
            placeholder="Full name"
            className="w-full border rounded-xl p-3 mb-3"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl p-3 mb-3"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          required
          minLength="6"
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl p-3 mb-3"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-3">
            {error}
          </div>
        )}

        <button className="w-full bg-indigo-600 text-white rounded-xl p-3 font-bold">
          {mode === "login" ? "Log in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="w-full mt-4 text-indigo-600 text-sm"
        >
          {mode === "login"
            ? "Create an account"
            : "Back to login"}
        </button>
      </form>
    </div>
  );
}

function Info({ icon: Icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <Icon className="text-indigo-600 mb-3" />
      <b>{title}</b>
      <p className="text-sm text-slate-500 mt-1">{text}</p>
    </div>
  );
}

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-black">{title}</h2>

          <button
            type="button"
            onClick={close}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qpuser") || "null");
    } catch {
      return null;
    }
  });

  const [db, setDb] = useState(load());
  const [hide, setHide] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    save(db);
  }, [db]);

  if (!user) {
    return (
      <Auth
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          setDb(load());
        }}
      />
    );
  }

  const currentUser =
    db.users.find((u) => u.id === user.id) || user;

  const history = db.tx.filter(
    (transaction) => transaction.user === currentUser.id
  );

  function logout() {
    localStorage.removeItem("qpuser");
    setUser(null);
  }

  function action(type) {
    const amount = Number(form.amount || 0);

    if (type !== "pin" && amount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    const data = structuredClone(db);

    const myUser = data.users.find(
      (u) => u.id === currentUser.id
    );

    if (!myUser) {
      setMessage("User account could not be found.");
      return;
    }

    if (type === "fund") {
      myUser.balance += amount;

      data.tx.unshift({
        id: Date.now(),
        user: myUser.id,
        type: "funding",
        amount,
        status: "success",
        note: "Demo wallet funding",
        date: new Date().toISOString(),
      });
    }

    if (type === "send") {
      const recipientEmail = String(form.email || "")
        .trim()
        .toLowerCase();

      const recipient = data.users.find(
        (u) => u.email === recipientEmail
      );

      if (!recipient) {
        setMessage("Recipient not found.");
        return;
      }

      if (recipient.id === myUser.id) {
        setMessage("Choose another user.");
        return;
      }

      const correctPin =
        form.pin === "1234" || form.pin === myUser.pin;

      if (!correctPin) {
        setMessage("Incorrect PIN.");
        return;
      }

      if (myUser.balance < amount) {
        setMessage("Insufficient balance.");
        return;
      }

      myUser.balance -= amount;
      recipient.balance += amount;

      data.tx.unshift({
        id: Date.now(),
        user: myUser.id,
        type: "transfer_out",
        amount,
        status: "success",
        note: "Transfer to " + recipient.email,
        date: new Date().toISOString(),
      });

      data.tx.unshift({
        id: Date.now() + 1,
        user: recipient.id,
        type: "transfer_in",
        amount,
        status: "success",
        note: "Transfer received",
        date: new Date().toISOString(),
      });
    }

    if (type === "withdraw") {
      const correctPin =
        form.pin === "1234" || form.pin === myUser.pin;

      if (!correctPin) {
        setMessage("Incorrect PIN.");
        return;
      }

      if (myUser.balance < amount) {
        setMessage("Insufficient balance.");
        return;
      }

      myUser.balance -= amount;

      data.tx.unshift({
        id: Date.now(),
        user: myUser.id,
        type: "withdrawal",
        amount,
        status: "pending",
        note: "Demo bank withdrawal",
        date: new Date().toISOString(),
      });
    }

    if (type === "pin") {
      if (!/^\d{4}$/.test(form.pin || "")) {
        setMessage("PIN must be exactly 4 digits.");
        return;
      }

      myUser.pin = form.pin;
    }

    setDb(data);
    setForm({});
    setModal(null);

    if (type === "fund") {
      setMessage("Wallet funded successfully (demo mode).");
    } else if (type === "send") {
      setMessage("Transfer successful (demo mode).");
    } else if (type === "withdraw") {
      setMessage("Withdrawal submitted (demo mode).");
    } else {
      setMessage("PIN saved successfully.");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl">
            <span className="bg-indigo-600 text-white rounded-xl p-2">
              <Wallet size={20} />
            </span>

            QuickPay
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <b>{currentUser.name}</b>

              <div className="text-xs text-slate-500">
                {currentUser.email}
              </div>
            </div>

            <button
              onClick={logout}
              className="border rounded-xl p-2"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-7">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 mb-6">
          <b>Demo mode:</b> payments and withdrawals are simulated
          locally. No bank or Paystack account is connected.
        </div>

        {message && (
          <div className="bg-indigo-50 text-indigo-800 rounded-xl p-3 mb-5 text-sm">
            {message}

            <button
              onClick={() => setMessage("")}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white rounded-3xl p-7 shadow-xl">
          <div className="text-indigo-100 text-sm">
            Available balance
          </div>

          <div className="flex items-center gap-3 text-4xl font-black mt-2">
            {hide
              ? "••••••"
              : money(currentUser.balance)}

            <button
              onClick={() => setHide(!hide)}
              type="button"
            >
              {hide ? <Eye /> : <EyeOff />}
            </button>
          </div>

          <div className="text-indigo-100 mt-4 text-sm">
            NGN wallet · Demo account
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-5">
          {[
            ["Fund wallet", PlusCircle, "fund"],
            ["Send money", Send, "send"],
            ["Withdraw", ArrowDownToLine, "withdraw"],
            ["Set PIN", ShieldCheck, "pin"],
          ].map(([name, Icon, key]) => (
            <button
              key={key}
              onClick={() => {
                setForm({});
                setModal(key);
              }}
              className="bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md"
            >
              <Icon className="text-indigo-600 mb-3" />

              <b>{name}</b>

              <div className="text-xs text-slate-500 mt-1">
                Open action
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl mt-6 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black flex gap-2 items-center">
              <History />
              Transaction history
            </h2>

            <button
              onClick={() => setDb(load())}
              className="text-indigo-600 text-sm"
            >
              Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">
              No transactions yet.
            </p>
          ) : (
            history.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between py-4 border-b last:border-0"
              >
                <div className="flex gap-3 items-center">
                  <span className="p-2 rounded-xl bg-slate-100">
                    {transaction.type === "transfer_out" ||
                    transaction.type === "withdrawal" ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownToLine size={18} />
                    )}
                  </span>

                  <div>
                    <b>{transaction.note}</b>

                    <div className="text-xs text-slate-500">
                      {new Date(
                        transaction.date
                      ).toLocaleString()}{" "}
                      · {transaction.status}
                    </div>
                  </div>
                </div>

                <b
                  className={
                    transaction.type === "funding" ||
                    transaction.type === "transfer_in"
                      ? "text-emerald-600"
                      : ""
                  }
                >
                  {transaction.type === "funding" ||
                  transaction.type === "transfer_in"
                    ? "+"
                    : "-"}
                  {money(transaction.amount)}
                </b>
              </div>
            ))
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Info
            icon={ShieldCheck}
            title="PIN security"
            text="4-digit authorization is demonstrated locally."
          />

          <Info
            icon={Users}
            title="Transfers"
            text="Send demo funds to another registered user."
          />

          <Info
            icon={BarChart3}
            title="Admin-ready"
            text="Transaction data is structured for a future admin dashboard."
          />
        </div>
      </main>

      {modal && (
        <Modal
          title={
            modal === "fund"
              ? "Fund Wallet"
              : modal === "send"
              ? "Send Money"
              : modal === "withdraw"
              ? "Withdraw"
              : "Set Transaction PIN"
          }
          close={() => setModal(null)}
        >
          {modal === "fund" && (
            <>
              <input
                type="number"
                placeholder="Amount ₦"
                className="field"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
              />

              <button
                className="primary"
                onClick={() => action("fund")}
              >
                Simulate payment
              </button>
            </>
          )}

          {modal === "send" && (
            <>
              <input
                type="email"
                placeholder="Recipient email"
                className="field"
                value={form.email || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Amount ₦"
                className="field"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
              />

              <input
                maxLength="4"
                inputMode="numeric"
                placeholder="4-digit PIN (demo: 1234)"
                className="field"
                value={form.pin || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pin: e.target.value,
                  })
                }
              />

              <button
                className="primary"
                onClick={() => action("send")}
              >
                Transfer
              </button>
            </>
          )}

          {modal === "withdraw" && (
            <>
              <input
                type="number"
                placeholder="Amount ₦"
                className="field"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
              />

              <input
                placeholder="Bank / account details (demo)"
                className="field"
                value={form.bank || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank: e.target.value,
                  })
                }
              />

              <input
                maxLength="4"
                inputMode="numeric"
                placeholder="4-digit PIN (demo: 1234)"
                className="field"
                value={form.pin || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pin: e.target.value,
                  })
                }
              />

              <button
                className="primary"
                onClick={() => action("withdraw")}
              >
                Submit withdrawal
              </button>
            </>
          )}

          {modal === "pin" && (
            <>
              <input
                maxLength="4"
                inputMode="numeric"
                placeholder="New 4-digit PIN"
                className="field"
                value={form.pin || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pin: e.target.value,
                  })
                }
              />

              <button
                className="primary"
                onClick={() => action("pin")}
              >
                Save PIN
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
