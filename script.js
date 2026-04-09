const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7orBcnsc9u4gsmfV7hLJSB8OLc5rCIQg10koUt_k1F3795I7dOUQgFbrJXOixy6c0IA/exec";

document.addEventListener("DOMContentLoaded", fetchActiveLoans);

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

async function fetchActiveLoans() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=getLoans`);
        const data = await res.json();
        
        const loanSelect = document.getElementById("loan-select");
        const customerNameField = document.getElementById("loan-customer-name");
        
        loanSelect.innerHTML = '<option value="">Select Loan</option>';
        
        data.forEach(loan => {
            const opt = document.createElement("option");
            opt.value = loan.loanId;
            
            // SHOWING BALANCE HERE
            opt.textContent = `${loan.loanId} (Bal: ${loan.balance})`;
            
            opt.dataset.name = loan.name;
            loanSelect.appendChild(opt);
        });

        loanSelect.onchange = () => {
            const selected = loanSelect.selectedOptions[0];
            customerNameField.textContent = selected?.dataset.name ? `Customer: ${selected.dataset.name}` : "";
        };
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function handleFormSubmit(event, type) {
    event.preventDefault();
    submitData(type);
}

function submitData(entryType) {
    const isPayment = entryType === 'Payment';
    const btn = document.querySelector('.tab-content.active .main-btn');
    const originalText = btn.innerText;

    const dataObj = {
        category: entryType,
        timestamp: new Date().toLocaleString('en-US', { 
            month: 'long', day: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        })
    };

    if (isPayment) {
        const loanSelect = document.getElementById("loan-select");
        if (!loanSelect.value) return alert("Please select a loan");
        dataObj.loanId = loanSelect.value;
        dataObj.name = loanSelect.selectedOptions[0].dataset.name;
        dataObj.amount = document.getElementById("pay-amount").value;
        dataObj.type = document.getElementById("pay-method").value;
    } else {
        dataObj.name = document.getElementById("name").value;
        dataObj.amount = document.getElementById("amount").value;
        dataObj.type = document.getElementById("type").value;
        dataObj.term = document.getElementById("term").value || "1";
        dataObj.description = document.getElementById("description").value || "No description";
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dataObj)
    })
    .then(() => {
        alert(`${entryType} Saved!`);
        resetForms();
        fetchActiveLoans(); // Refresh dropdown list
    })
    .catch(err => alert("Error: " + err))
    .finally(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

function resetForms() {
    document.querySelectorAll('form').forEach(form => form.reset());
    document.getElementById("loan-customer-name").textContent = "";
}