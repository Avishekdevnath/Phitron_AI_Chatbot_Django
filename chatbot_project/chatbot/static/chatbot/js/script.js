

document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");
    const chatBox = document.getElementById("chat-box");

    
    fetch('/chat-history/')
        .then(response => response.json())
        .then(data => {
            data.history.forEach(message => {
                appendMessage(message.user_input, "user-message");
                appendMessage(message.bot_response, "bot-message", true);
            });
        });

    sendButton.addEventListener("click", function () {
        sendMessage();
    });

    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            if (event.shiftKey) {
                event.preventDefault();
                inputField.value += "\n"; 
                adjustInputHeight();
            } else {
                event.preventDefault();
                sendMessage();
            }
        }
    });

    function sendMessage() {
        const userInput = inputField.value.trim();
        if (userInput === "") return;

        appendMessage(userInput, "user-message");

        fetch('/', {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", "X-CSRFToken": csrf_token },
            body: `user_input=${encodeURIComponent(userInput)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            appendMessage(data.response, "bot-message", true);
        });

        inputField.value = "";
    }

    function appendMessage(message, type, isHTML = false) {
        const chatMessage = document.createElement("div");
        chatMessage.classList.add("chat-message", type);

        if (isHTML) {
            chatMessage.innerHTML = message;
        } else {
            chatMessage.innerText = message;
        }

        chatBox.appendChild(chatMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function adjustInputHeight() {
        inputField.style.height = "auto";
        inputField.style.height = (inputField.scrollHeight) + "px";
    }
});
