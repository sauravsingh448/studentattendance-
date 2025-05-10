//Data storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

// dom element
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a, .sidebar a');
const studentForm = document.getElementById('studentForm');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const reportTableBody = document.getElementById('reportTableBody');
const saveAttendanceBtn = document.getElementById('saveAttendance');
const generateReportBtn = document.getElementById('generateReport');

// Search Students Functionality
const searchStudentsBtn = document.getElementById('searchStudents');
const studentsTableBody = document.getElementById('studentsTableBody');
const feedbackMessage = document.getElementById('feedbackMessage');

// Delete Student Functionality
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.querySelector('.close-modal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
let selectedStudent = null;

// responsive the Navbar section 
let menuList = document.getElementById("menuList");
menuList.style.maxHeight = "0px";

function toggleMenu() {
    if (menuList.style.maxHeight == "0px") {
        menuList.style.maxHeight = "300px";
    } else {
        menuList.style.maxHeight = "0px";
    }
}
// Sidebar Toggle Functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const closeSidebar = document.getElementById('closeSidebar');

// Toggle sidebar when clicking the toggle button
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
});

// Close sidebar when clicking the close button
closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');

        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // show target page or work on nav or Sidebar

        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetPage) {
                page.classList.add('active');
            }
        });
    });
});

//Add student 
studentForm.addEventListener('submit', (e) => {
    e.preventDefault(); //preventDefault() method in JavaScript is used to stop the default action of an HTML element
    // json formet
    const student = {
        id: document.getElementById('studentId').value,
        name: document.getElementById('studentName').value,
        class: document.getElementById('studentClass').value,
        roll: document.getElementById('studentRoll').value,
    };
    // push the data local storage json 
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    // Reset form
    studentForm.reset();
    // Show success message
    alert('Student added successfully!');
    // Update dashboard
    updateDashboard();
});
// update Dashboard
function updateDashboard() {
    const totalStudents = students.length;
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceRecords.find(record => record.date === today) || { present: 0, absent: 0 };

    document.querySelectorAll('.stat-number')[0].textContent = totalStudents;
    document.querySelectorAll('.stat-number')[1].textContent = todayAttendance.present;
    document.querySelectorAll('.stat-number')[2].textContent = todayAttendance.absent;
}


// Load Attendance Table
function loadAttendanceTable() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;

    attendanceTableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>
                <select class="attendance-status">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                </select>
            </td>
        `;
        attendanceTableBody.appendChild(row);
    });
}


// Save Attendance
saveAttendanceBtn.addEventListener('click', () => {
    const date = document.getElementById('attendanceDate').value;
    const statusSelects = document.querySelectorAll('.attendance-status');

    let present = 0;
    let absent = 0;

    statusSelects.forEach(select => {
        if (select.value === 'present') {
            present++;
        } else {
            absent++;
        }
    });

    const record = {
        date,
        present,
        absent,
        total: present + absent
    };

    // Update or add attendance record
    const existingRecordIndex = attendanceRecords.findIndex(r => r.date === date);
    if (existingRecordIndex !== -1) {
        attendanceRecords[existingRecordIndex] = record;
    } else {
        attendanceRecords.push(record);
    }

    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    alert('Attendance saved successfully!');
    updateDashboard();
});

// Load Reports
function loadReports() {
    reportTableBody.innerHTML = '';

    attendanceRecords.forEach(record => {
        const percentage = ((record.present / record.total) * 100).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.total}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>${percentage}%</td>
        `;
        reportTableBody.appendChild(row);
    });
}
// Generate Report
generateReportBtn.addEventListener('click', () => {
    const fromDate = document.getElementById('reportDateFrom').value;
    const toDate = document.getElementById('reportDateTo').value;

    if (!fromDate || !toDate) {
        alert('Please select both date range values');
        return;
    }

    const filteredRecords = attendanceRecords.filter(record => {
        return record.date >= fromDate && record.date <= toDate;
    });

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Total Students,Present,Absent,Percentage\n";

    filteredRecords.forEach(record => {
        const percentage = ((record.present / record.total) * 100).toFixed(2);
        csvContent += `${record.date},${record.total},${record.present},${record.absent},${percentage}%\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Search Students
searchStudentsBtn.addEventListener('click', () => {
    const searchId = document.getElementById('searchId').value.toLowerCase();
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const searchClass = document.getElementById('searchClass').value.toLowerCase();

    const filteredStudents = students.filter(student => {
        return (
            student.id.toLowerCase().includes(searchId) &&
            student.name.toLowerCase().includes(searchName) &&
            student.class.toLowerCase().includes(searchClass)
        );
    });
    if (filteredStudents.length === 0) {
        showFeedback('No students found matching your search criteria.', 'error');
    } else {
        showFeedback(`Found ${filteredStudents.length} student(s) matching your search.`, 'success');
    }
    displayStudents(filteredStudents);
});
// Display Students in Table
function displayStudents(studentsList) {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    if (studentsList.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="no-results">No students found</td>';
        tableBody.appendChild(row);
        return;
    }
    studentsList.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.roll}</td>
            <td>
                <button class="btn-danger delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const studentId = e.target.getAttribute('data-id');
            selectedStudent = students.find(s => s.id === studentId);
            showDeleteModal(selectedStudent);
        });
    });
}
// Show Delete Modal
function showDeleteModal(student) {
    document.getElementById('previewName').textContent = student.name;
    document.getElementById('previewId').textContent = student.id;
    document.getElementById('previewClass').textContent = student.class;
    document.getElementById('previewRoll').textContent = student.roll;

    deleteModal.style.display = 'block';
}
// Close Modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
    selectedStudent = null;
}
//Confirm Delete
confirmDeleteBtn.addEventListener('click', () => {
    if (selectedStudent) {
        try {
            // Remove student from array
            students = students.filter(s => s.id !== selectedStudent.id);

            // Update local storage
            localStorage.setItem('students', JSON.stringify(students));

            // Close modal and refresh display
            closeDeleteModal();
            displayStudents(students);
            updateDashboard();

            // Show success message
            showFeedback('Student deleted successfully!', 'success');
        } catch (error) {
            showFeedback('Error deleting student. Please try again.', 'error');
        }
    }
});
// Show Feedback Message
function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message ${type}`;
    setTimeout(() => {
        feedbackMessage.style.display = 'none';
    }, 3000);
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    loadAttendanceTable();
    loadReports();
    displayStudents(students);
});