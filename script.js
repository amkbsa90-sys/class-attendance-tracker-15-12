// Firebase SDK imports
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Get database instance
const db = window.firebaseDB; // Use the global database from index.html

// Generate or retrieve unique device ID
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = Date.now().toString(); // simple unique ID
  localStorage.setItem("deviceId", deviceId);
}
console.log("Device ID:", deviceId);

// DOM elements
const form = document.getElementById("attendanceForm");
const attendanceList = document.getElementById("attendanceList");

// Reference to device-specific database node
const attendanceRef = ref(db, "attendance/" + deviceId);

// LOAD DATA FROM FIREBASE (real-time)
onValue(attendanceRef, (snapshot) => {
  attendanceList.innerHTML = ""; // clear table

  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.key;
    const data = childSnapshot.val();
    addRow(key, data.name, data.status);
  });
});

// ADD STUDENT
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  if (studentName === "") return;

  push(attendanceRef, {
    name: studentName,
    status: "Absent"
  });

  document.getElementById("studentName").value = "";
});

// ADD ROW TO TABLE
function addRow(id, name, status) {
  const row = document.createElement("tr");

  // Name column
  const nameCol = document.createElement("td");
  nameCol.textContent = name;

  // Status column
  const statusCol = document.createElement("td");
  statusCol.textContent = status;

  // Actions column
  const actionsCol = document.createElement("td");

  // Present button
  const presentBtn = document.createElement("button");
  presentBtn.textContent = "Mark Present";
  presentBtn.onclick = () => {
    update(ref(db, "attendance/" + deviceId + "/" + id), {
      status: "Present"
    });
  };

  // Absent button
  const absentBtn = document.createElement("button");
  absentBtn.textContent = "Mark Absent";
  absentBtn.onclick = () => {
    update(ref(db, "attendance/" + deviceId + "/" + id), {
      status: "Absent"
    });
  };

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => {
    remove(ref(db, "attendance/" + deviceId + "/" + id));
  };

  actionsCol.append(presentBtn, absentBtn, deleteBtn);
  row.append(nameCol, statusCol, actionsCol);
  attendanceList.appendChild(row);
}