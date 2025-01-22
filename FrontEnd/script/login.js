// Récupération des champs du formulaire
let login = document.querySelector("#email");
let password = document.querySelector("#password");
let submit = document.querySelector("input[type = submit]");

/* -----  eventListener pour le btn "submit" ---- */
submit.addEventListener("click", function (event) {
  event.preventDefault(); // Empêche le rechargement de la page
  handleLogin(); // Appelle une fonction pour gérer la connexion
});

/* ---- fonction pour gérer la connex° ---- */
async function handleLogin() {
  // recup des valeurs des champs
  const emailValue = login.value;
  const passwordValue = password.value;

  // Verifie que champs sont remplis
  if (!emailValue || !passwordValue) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  // Prepare données pour envoi au serveur
  const payload = {
    email: emailValue,
    password: passwordValue,
  };

  try {
    // envoi de la request POST au serveur
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Réponse du serveur :", response);

    if (response.ok) {
      const data = await response.json();
      console.log("Connexion réussie :", data);

      // Vérifiez que le token est présent
      if (data.token) {
        // stocke le token dans localStorage
        localStorage.setItem("authToken", data.token);
        console.log("Token stocké :", localStorage.getItem("authToken"));
        
        // redirection vers page d'accueil
        window.location.href = "/FrontEnd/script/index.html"; // Assurez-vous que ce chemin est correct
      } else {
        console.error("Erreur : Le token est manquant dans la réponse");
        alert("Une erreur est survenue. Merci de réessayer plus tard.");
      }
    } else {
      // afficher message d'erreur si connex° echoue
      const errorData = await response.json();
      console.error("Erreur : Identifiants incorrects", errorData);
      alert("Identifiants incorrects. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error.message);
    alert("Une erreur est survenue. Merci de réessayer plus tard.");
  }
}