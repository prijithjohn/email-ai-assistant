console.log("Email Writer Extension Loaded");

let currentPopup = null;

/* ---------------- BUTTON ---------------- */

function createAIButton() {
    const button = document.createElement('div');

    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.innerHTML = 'AI Reply';

    button.style.marginRight = '8px';
    button.style.padding = '6px 10px';
    button.style.borderRadius = '6px';
    button.style.fontSize = '12px';
    button.style.cursor = 'pointer';
    button.style.background = '#5b5fc7';
    button.style.color = 'white';
    button.style.border = 'none';

    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');

    return button;
}

/* ---------------- API ---------------- */

async function callAI(action, emailContent) {
    const response = await fetch('http://localhost:8081/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            emailContent,
            tone: "Professional",
            action
        })
    });

    const data = await response.json();
    return data.reply;
}

/* ---------------- EMAIL CONTENT ---------------- */

function getEmailContent() {
    const selectors = [
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.innerText.trim();
    }

    return '';
}

async function regenerateAI(action, emailContent, tone) {
    const response = await fetch('http://localhost:8081/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            emailContent,
            tone,
            action
        })
    });

    const data = await response.json();
    return data.reply;
}

/* ---------------- COMPOSE BOX ---------------- */

function getComposeBox() {
    return (
        document.querySelector('[role="textbox"][contenteditable="true"]') ||
        document.querySelector('.Am.Al.editable') ||
        document.querySelector('[g_editable="true"]')
    );
}

/* ---------------- POPUP (GRAMMARLY STYLE) ---------------- */

function createPopup(initialText) {

    if (currentPopup) currentPopup.remove();

    let currentText = initialText;
    let minimized = false;

    const popup = document.createElement("div");

    /* ---------------- STYLE (GRAMMARLY STYLE FLOATING) ---------------- */
 popup.style.position = "fixed";
popup.style.width = "340px";
popup.style.maxHeight = "420px";

popup.style.background = "rgba(30, 30, 30, 0.72)";
popup.style.backdropFilter = "blur(12px)";

popup.style.color = "white";
popup.style.padding = "0";   // important (we handle inside body)
popup.style.borderRadius = "12px";
popup.style.zIndex = "999999";
popup.style.boxShadow = "0 12px 30px rgba(0,0,0,0.4)";
popup.style.fontSize = "13px";

popup.style.overflow = "hidden";

/* IMPORTANT: start position (prevents jump bug) */
popup.style.top = "120px";
popup.style.left = "120px";

    popup.innerHTML = `
        <div id="popup-header" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:10px;
            cursor:move;
            background:#2a2a2a;
            border-radius:12px 12px 0 0;
        ">
            <b>AI Assistant</b>
            <div>
                <button id="minimize-btn">—</button>
                <button id="close-popup">✕</button>
            </div>
        </div>

        <div id="popup-body" style="
    padding:10px;
    max-height: 360px;
    overflow-y: auto;
    display:flex;
    flex-direction:column;
    gap:10px;
">

         <div id="popup-content" style="
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 6px;
">
</div>

            <div>
                <label>Tone:</label>
                <select id="tone-select" style="
                    margin-left:8px;
                    padding:4px;
                    border-radius:6px;
                    background:#333;
                    color:white;
                    border:none;
                ">
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Formal</option>
                    <option>Confident</option>
                    <option>Concise</option>
                    <option>Persuasive</option>
                </select>
            </div>

            <div style="display:flex;gap:8px;">
                <button id="apply-ai" style="flex:1;background:#4caf50;color:white;padding:6px;border-radius:6px;border:none;">Apply</button>
                <button id="copy-ai" style="flex:1;background:#444;color:white;padding:6px;border-radius:6px;border:none;">Copy</button>
            </div>

            <button id="regenerate-ai" style="background:#ff9800;color:white;padding:6px;border-radius:6px;border:none;">
                Regenerate
            </button>

        </div>
    `;

    document.body.appendChild(popup);

    const contentBox = popup.querySelector("#popup-content");
    contentBox.innerText = currentText;

    currentPopup = popup;

    /* ---------------- CLOSE ---------------- */
    popup.querySelector("#close-popup").onclick = () => popup.remove();

    /* ---------------- COPY ---------------- */
    popup.querySelector("#copy-ai").onclick = () => {
        navigator.clipboard.writeText(currentText);
    };

    /* ---------------- APPLY ---------------- */
    popup.querySelector("#apply-ai").onclick = () => {
        const composeBox = getComposeBox();
        if (!composeBox) return alert("Compose box not found");

        composeBox.focus();
        document.execCommand("insertText", false, currentText);
    };

    /* ---------------- REGENERATE ---------------- */
    popup.querySelector("#regenerate-ai").onclick = async () => {

        const tone = popup.querySelector("#tone-select").value;

        contentBox.innerText = "Regenerating...";

        const newReply = await regenerateAI("Reply", currentText, tone);

        currentText = newReply;
        contentBox.innerText = newReply;
    };

    /* ---------------- MINIMIZE ---------------- */
    popup.querySelector("#minimize-btn").onclick = () => {
        minimized = !minimized;
        popup.querySelector("#popup-body").style.display = minimized ? "none" : "flex";
    };

    /* ---------------- DRAG ---------------- */
  let isDragging = false;
let offsetX = 0, offsetY = 0;

const header = popup.querySelector("#popup-header");

header.onmousedown = (e) => {
    isDragging = true;

    const rect = popup.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    header.style.cursor = "grabbing";
};

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    popup.style.left = `${e.clientX - offsetX}px`;
    popup.style.top = `${e.clientY - offsetY}px`;

    popup.style.right = "auto";
    popup.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    header.style.cursor = "grab";
});

    return popup;
}

/* ---------------- MAIN BUTTON INJECTION ---------------- */

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
    }

    return null;
}

function injectButton() {

    // prevent duplicates
    if (document.querySelector('.ai-reply-button')) return;

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {

        try {
            button.innerHTML = '⏳ Thinking...';
            button.disabled = true;

            const emailContent = getEmailContent();

            if (!emailContent || emailContent.length < 5) {
                alert("No email detected");
                return;
            }

            const reply = await callAI("Reply", emailContent);

            const composeBox = getComposeBox();

            if (!composeBox) {
                console.error("Compose box not found");
                return;
            }

          createPopup(reply);

        } catch (err) {
            console.error(err);
            alert("AI failed");
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

/* ---------------- OBSERVER (FIXED) ---------------- */

const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        const nodes = [...m.addedNodes];

        const found = nodes.some(node =>
            node.nodeType === 1 &&
            (node.matches?.('.aDh, .btC, [role="dialog"]') ||
                node.querySelector?.('.aDh, .btC, [role="dialog"]'))
        );

        if (found) {
            setTimeout(injectButton, 800);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});