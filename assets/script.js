/* STAV102 Test 1 Results Portal
   Reads data/students.xlsx (via SheetJS) and looks up a single student
   by student number entered over the cover image. No student list is
   ever rendered in bulk — only the one record that matches the number typed. */

(function () {
  "use strict";

  const DATA_URL = "data/students.xlsx";

  const els = {
    form: document.getElementById("lookupForm"),
    input: document.getElementById("studentNumber"),
    btn: document.getElementById("searchBtn"),
    status: document.getElementById("lookupStatus"),
    coverState: document.getElementById("coverState"),
    resultState: document.getElementById("resultState"),
    resultCard: document.getElementById("resultCard"),
    name: document.getElementById("resStudentName"),
    number: document.getElementById("resStudentNumber"),
    badge: document.getElementById("resBadge"),
    marksGrid: document.getElementById("resMarksGrid"),
    lq: document.getElementById("resLQ"),
    mcq: document.getElementById("resMCQ"),
    final: document.getElementById("resFinal"),
    pct: document.getElementById("resPct"),
    comment: document.getElementById("resComment"),
    officeNotice: document.getElementById("resOfficeNotice"),
    again: document.getElementById("searchAgainBtn"),
  };

  let studentIndex = null; // Map<studentNumber string, record>

  // ---------- Load & parse the Excel workbook ----------
  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Could not fetch data file (" + res.status + ")");
      return res.arrayBuffer();
    })
    .then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      studentIndex = new Map();
      rows.forEach((row) => {
        const key = String(row.StudentNumber).trim();
        studentIndex.set(key, row);
      });

      els.status.textContent = "";
      els.btn.disabled = false;
    })
    .catch((err) => {
      console.error(err);
      els.status.textContent =
        "Results data could not be loaded right now. Please try again later or contact the department.";
      els.status.classList.add("is-error");
    });

  // ---------- Comment bank ----------
  function getComment(pct) {
    if (pct >= 90) {
      return "Outstanding work — a mark in the 90s reflects real mastery of this section of the module. " +
        "Keep doing exactly what you're doing: work through problems without looking at the memo first, " +
        "and consider helping a study partner explain concepts back to you — teaching others is one of the " +
        "best ways to keep your own understanding sharp for the exam.";
    }
    if (pct >= 80) {
      return "Excellent result! You clearly have a strong handle on the material. To stay at this level, keep " +
        "practising past papers under timed conditions and pay close attention to the one or two questions " +
        "you lost marks on — tightening those up is often the difference between a great mark and a perfect one.";
    }
    if (pct >= 70) {
      return "Great job — this is a strong, confident pass. Keep up your current study habits, and use your " +
        "tutorial and consultation time to ask about the specific question types that cost you marks. A little " +
        "extra polish on exam technique (showing all working, managing your time) will help you push even higher.";
    }
    if (pct >= 60) {
      return "Well done, this is a solid pass. You're clearly grasping the core concepts — now focus on " +
        "consistency. Redo the questions you found trickiest without your notes, and work through a few extra " +
        "practice problems each week so the harder concepts become as automatic as the easier ones.";
    }
    if (pct >= 50) {
      return "Congratulations on passing! This is a good foundation to build on. To strengthen your mark for " +
        "Test 2, go back through your Test 1 paper and identify exactly where marks were lost, then revisit " +
        "those topics in your tutorial sessions. Steady, regular practice from here will make a real difference.";
    }
    if (pct >= 40) {
      return "You were close to a pass, and that's a good sign — the gap is small and very closeable. Go through " +
        "your paper question by question to see exactly where the marks slipped away, prioritise those topics in " +
        "your next few study sessions, and make full use of tutorials and consultation time before Test 2.";
    }
    if (pct >= 25) {
      return "This result shows there are some real gaps to close, but they're absolutely closeable with focused " +
        "effort. Start by reviewing the fundamentals for each section rather than jumping straight to harder " +
        "problems, attend tutorials consistently, and don't hesitate to bring your specific questions to a " +
        "consultation — a bit of one-on-one clarity now will pay off for Test 2.";
    }
    return "This result is a sign that it's time for a real reset on study approach, not a reason to be " +
      "discouraged — plenty of students turn results like this around. Please come speak to your lecturer or " +
      "attend consultation as soon as possible so you can build a clear plan together, start from the basics " +
      "of each topic, and rebuild your confidence one concept at a time before Test 2.";
  }

  // ---------- Render ----------
  function renderResult(record) {
    els.coverState.hidden = true;
    els.resultState.hidden = false;
    window.scrollTo(0, 0);

    els.name.textContent = record.Surname || "—";
    els.number.textContent = "Student number: " + record.StudentNumber;

    els.resultCard.classList.remove("state-pass", "state-fail", "state-pending", "state-dnw");
    els.officeNotice.hidden = true;
    els.marksGrid.hidden = false;

    const status = String(record.Status || "").trim();

    if (status === "DID NOT WRITE") {
      els.resultCard.classList.add("state-dnw");
      els.badge.textContent = "Did Not Write";
      els.marksGrid.hidden = true;
      els.comment.textContent =
        "Our records show you did not write Test 1 of STAV102. Please contact the department as soon as " +
        "possible to discuss your options ahead of Test 2.";
      return;
    }

    if (status === "PENDING") {
      els.resultCard.classList.add("state-pending");
      els.badge.textContent = "Marks Incomplete";
      els.lq.textContent = record.LongQuestion === "" ? "Missing" : record.LongQuestion;
      els.mcq.textContent = record.MCQ === "" ? "Missing" : record.MCQ;
      els.final.textContent = "Pending";
      els.pct.textContent = "Pending";
      els.comment.textContent =
        "Part of your Test 1 mark is still outstanding on our records (either the Long Question or the MCQ " +
        "section). This needs to be sorted out before a final mark can be confirmed.";
      els.officeNotice.hidden = false;
      return;
    }

    // PASS or FAIL — full marks available
    const isPass = status === "PASS";
    els.resultCard.classList.add(isPass ? "state-pass" : "state-fail");
    els.badge.textContent = isPass ? "Passed" : "Not Yet a Pass";

    els.lq.textContent = record.LongQuestion;
    els.mcq.textContent = record.MCQ;
    els.final.textContent = record.FinalMark + " / 50";
    els.pct.textContent = record.Percentage + "%";

    els.comment.textContent = getComment(Number(record.Percentage));
  }

  function showNotFound(value) {
    els.status.textContent =
      'No record found for student number "' + value + '". Please double-check the number and try again.';
    els.status.classList.add("is-error");
  }

  function handleSearch() {
    const value = els.input.value.trim();
    els.status.classList.remove("is-error");

    if (!value) {
      els.status.textContent = "Please enter your student number.";
      els.status.classList.add("is-error");
      return;
    }
    if (!studentIndex) {
      els.status.textContent = "Results are still loading — please wait a moment and try again.";
      return;
    }

    const record = studentIndex.get(value);
    if (!record) {
      showNotFound(value);
      return;
    }
    els.status.textContent = "";
    renderResult(record);
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch();
  });

  els.again.addEventListener("click", () => {
    els.resultState.hidden = true;
    els.coverState.hidden = false;
    els.input.value = "";
    els.status.textContent = "";
    els.status.classList.remove("is-error");
    window.scrollTo(0, 0);
    els.input.focus();
  });
})();
