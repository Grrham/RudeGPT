const firebaseConfig = {
    // enter firebase config here
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


function createLogin(){

    let email = document.getElementById('email-login').value
    let password = document.getElementById('password-login').value

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            alert("User " + user.email + " created!");
            // feedback that user account was created
            console.log("User " + user.email + " created!");
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
    });
}

function signIn() {
    let email = document.getElementById('email-login').value;
    let password = document.getElementById('password-login').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            let user = userCredential.user.uid;

            // Store user data in localStorage
            localStorage.setItem('user', user);
            // storing this data allows other functions to easily grab the UID to store chats filtered by it, along with get chats with it stored
            window.location.href = 'chat.html';

        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(error);
        });
}

function checkIfLoggedIn() {
    firebase.auth().onAuthStateChanged((currentUser) => {
        if (currentUser) {
            let user = currentUser.uid;
            // Store user data in localStorage
            localStorage.setItem('user', user);

            window.location.href = 'chat.html';
        } else {
            // No user is signed in
            console.log("No users currently signed in");
        }
    });
}


function signOut(){

firebase.auth().signOut().then(() => {
    console.log('user is signed out')
    window.location.href = 'logIn.html';

}).catch((error) => {

});
}


if (window.location.pathname === '/logIn.html') {
    // if on the login page and a user is already signed in they will be redirected to the chat page
    checkIfLoggedIn();
}


function sendChat() {
    let input = document.getElementById('content').value;
    let loadingSpinner = document.getElementById('loading-spinner');

    loadingSpinner.style.display = 'inline-block';
    // displays a loading icon once chat is sent

    let apiEndPoint = "https://api.openai.com/v1/chat/completions";
    let customHeaders = {
        'Content-Type': 'application/json',
        // 'Authorization': 'openai api key here'
    };

    let data = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "reply in a short snarky tone and don't answer questions, for the first message reply with something mean and make them feel uninvited, and proceed to be rude afterwards"
            },
            {
                role: "user",
                content: input
            }
        ]
    };

    let fetchOptions = {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(data)
    };

    fetch(apiEndPoint, fetchOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log(input);
            console.log(data.choices[0].message.content);

            loadingSpinner.style.display = 'none';

            let user = localStorage.getItem('user');
            // grabs the UID from local storage to ten store chats under it

            if (user) {
                db.collection("savedchats").add({
                    user: user,
                    content: input,
                    response: data.choices[0].message.content,
                    timestamp: new Date().getTime(),
                })
                    .then(() => {
                        console.log("Note successfully written!");
                        displayChats();
                        // calls display chat function to "refresh" the page and render new responses
                    })
                    .catch((error) => {
                        console.error("Error writing note: ", error);
                    });
            } else {
                console.error("User is not defined.");
            }

            document.getElementById('content').value = '';
            // clears input feild after sending chat

        })
        .catch((error) => {
            loadingSpinner.style.display = 'none';
            // hides loading icon after the response is rendered
            console.error("Error sending chat message: ", error);
        });
}


function displayChats() {
    let displayElement = document.getElementById('display');

    let user = localStorage.getItem('user');
    // grabs the UID from local storage

    if (!displayElement) {
        console.error("Error: 'display' element not found.");
        return;
    }

    displayElement.innerHTML = "";

    db.collection("savedchats")
        .orderBy("timestamp") // Order by timestamp for a chronological display
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let noteData = doc.data();
                if (noteData.user === user) {
                    displayElement.innerHTML += `
                        <div>
                            <p class="user-message">${noteData.content}</p>
                            <p class="rudegpt-message">${noteData.response}</p>
                            <p>Date: ${new Date(noteData.timestamp).toLocaleString()}</p>
                        </div>
                    `; // pre-formats the display and creates seperate class names for user messages and gpt messages to have seperate styling for both
                }
            });
            var displayDiv = document.getElementById('display');
            displayDiv.scrollTop = displayDiv.scrollHeight;
            console.log("Welcome to RudeGPT");
        })
        .catch((error) => {
            console.log("Error getting saved notes: ", error);
        });
}


console.log('Script loaded.');
        displayChats();
        // calls the display chat function on page load