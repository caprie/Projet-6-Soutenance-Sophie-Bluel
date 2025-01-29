// Récupération des champs du formulaire
let login = document.querySelector("#email"); // Récupère l'élément avec l'id "email"
let password = document.querySelector("#password"); // Récupère l'élément avec l'id "password"
let submit = document.querySelector("input[type = submit]"); // Récupère le bouton de type "submit"

/* -----  eventListener pour le btn "submit" ---- */
submit.addEventListener("click", function (event) { // Ajoute un écouteur d'événements sur le bouton "submit"
  event.preventDefault(); // Empêche le rechargement de la page
  handleLogin(); // fonction pour gérer la connexion
});

/* ---- fonction pour gérer la connex° ---- */
async function handleLogin() { //gérer la connexion
  // recup des valeurs des champs
  const emailValue = login.value; // Récupère la valeur "email"
  const passwordValue = password.value; // Récupère la valeur de l'input "password"

  // Verifie que champs sont remplis
  if (!emailValue || !passwordValue) { 
    alert("Veuillez remplir tous les champs.");   
    return;   
  }

  // Prepare données pour envoi au serveur
  const payload = { // objet contenant les informations de connexion (email et mot de passe) à envoyer au serveur pour authentification.
    email: emailValue, 
    password: passwordValue, 
  };

  try { 
    // envoi de la request POST au serveur
    const response = await fetch("http://localhost:5678/api/users/login", { // Envoi d'une requête POST à l'URL spécifiée
      method: "POST",  
      
      headers: { // headers : objet contenant les en-têtes HTTP de la requête
        "Content-Type": "application/json",   // Content-Type : type de contenu de la requête
      },
      body: JSON.stringify(payload), // body : corps de la requête, contient les données à envoyer au serveur
    });

    if (response.ok) { 
      const data = await response.json(); // Récupère les données de la réponse
      console.log("Réponse du serveur :", data); 

      // Vérifiez que le token est présent
      if (data.token) { 
        // stocke le token dans localStorage
        localStorage.setItem("authToken", data.token); 
        console.log("Token stocké :", localStorage.getItem("authToken"));   // Affiche le token stocké dans la console

        // redirection vers page d'accueil
        window.location.href = "/FrontEnd/script/index.html"; // Redirige vers la page d'accueil
      } else {
        console.error("Erreur : Le token est manquant dans la réponse"); 
        alert("Une erreur est survenue. Merci de réessayer plus tard."); 
      }
    } else { 
      // afficher message d'erreur si connex° echoue
      const errorData = await response.json(); // Récupère les données de l'erreur
      console.error("Erreur : Identifiants incorrects", errorData); 
      alert("Identifiants incorrects. Veuillez réessayer."); // Affiche un message d'alerte
    }
  } catch (error) { // Gestion des erreurs
    console.error("Erreur lors de la connexion :", error.message); 
    alert("Une erreur est survenue. Merci de réessayer plus tard."); // Affiche un message d'alerte
  }
}
