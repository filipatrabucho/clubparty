const form = document.querySelector(".form");

function sendEmail(e) {
  e.preventDefault();

  const name = document.querySelector(".name"),
    user = document.querySelector(".username"),
    email = document.querySelector(".email"),
    msg = document.querySelector(".message");

  Email.send({
    SecureToken: "4ce3169f-042f-4bb7-b155-27ff1e309554",
    To: "clubpartyserver@gmail.com",
    From: email.value,
    Subject: "Support from Website",
    Body:
      "name: " +
      name.value +
      "<br> username: " +
      user.value +
      "<br> message: " +
      msg.value,
  }).then((message) => alert(message));
}

form.addEventListener("submit", sendEmail);
