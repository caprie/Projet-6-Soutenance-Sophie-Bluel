let openModalGalleryCallCount = 0; // Variable globale pour compter les appels
let showWorksCallCount = 0; // Variable globale pour compter les appels

//----------RECUPERATION DES API ----------

// Fonction pour récupérer les TRAVAUX depuis l'API
async function getWorks() { 
  const url = "http://localhost:5678/api/works"; // URL de l'API
  try { // Gestion des erreurs
    const response = await fetch(url); 
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`); // Lance une erreur si la réponse n'est pas ok
    }
    const works = await response.json(); // Récupère les travaux de la réponse
    return works;   // Retourne les travaux
  } catch (error) { 
    console.error("Erreur lors de la récupération des works :", error.message); 
  }
}

// Fonction pour récupérer les CATEGORIES depuis l'API
async function getCategories() { 
  const url = "http://localhost:5678/api/categories";   
  try {   // Gestion des erreurs
    const response = await fetch(url);  // Envoi d'une requête GET à l'URL spécifiée
    if (!response.ok) { 
      throw new Error(`Erreur : ${response.status}`); // Lance une erreur
    }
    // Convertit les données de la réponse en JSON pour les rendre utilisables
    const categories = await response.json(); // Récupère les catégories de la réponse
    return categories;  // Retourne les catégories
  } catch (error) { 
    console.error( 
      "Erreur lors de la récupération des catégories :",  
      error.message 
    ); 
  }
}

//---------------------STYLE DYNAMIQUE BTN NAV  --------------------

const links = document.querySelectorAll("nav a");  // Sélectionne tous les liens dans la barre de navigation

const currentPath = window.location.href; //recupere l'url de la page affichée

links.forEach((link) => { 
  if (currentPath === link.href) { // Si l'URL de la page correspond à l'URL du lien
    link.classList.add("active"); // Ajoute la classe "active" au lien
  }
});

//------------------- style logout -----------------
// Fonction pour basculer le texte et l'action du bouton Login/Logout
function toggleLoginLogoutButton() { // basculer le texte du bouton Login/Logout
  const loginLogoutButton = document.getElementById("loginLogoutButton");   // Sélectionne le bouton Login/Logout

  if (loginLogoutButton) { 
    if (localStorage.getItem("authToken")) { // Si un token est présent dans le localStorage
      loginLogoutButton.textContent = "Logout";   // Change le texte du bouton en "Logout"
      loginLogoutButton.onclick = () => { // Ajoute une action au clic sur le bouton
        localStorage.removeItem("authToken");   // Supprime le token du localStorage
        window.location.href = "/FrontEnd/login.html"; // Redirige vers la page de connexion
      };
    } else { 
      loginLogoutButton.textContent = "Login";  // Change le bouton en "Login"
      loginLogoutButton.onclick = () => { // au clic sur le bouton
        window.location.href = "/FrontEnd/login.html"; // Redirige vers la page de connexion
      };
    }
  } else { 
    console.error( 
      "Erreur : L'élément avec l'ID 'loginLogoutButton' est introuvable."   
    );
  }
}

// --------------- CREATION ET AFFICHAGE DES CATEGORIES ----------

// Fonction pour créer et afficher le menu des catégories
async function createCategoryMenu() { // créer et afficher le menu des catégories
  // Récupère les catégories depuis l'API
  const categories = await getCategories(); 
  if (!categories) { // Si aucune catégorie n'est récupérée
    console.error("Pas de catégories récupérées"); 
    return;   
  }

  // --------------------- AJOUT DES BUTTONS ET CATEGORIES --------------------

  // -------------------- CONTAINER ------------------------

  const portfolioSection = document.querySelector("#portfolio"); // id "portfolio"
  const menu = document.createElement("div"); // Crée div pour le menu
  menu.id = "menu-categories";  // Ajoute  ID au menu
  portfolioSection.insertBefore(  // Insère le menu avant
    menu,
    portfolioSection.querySelector(".gallery")  // Sélectionne la galerie
  );

  // ---------------------------- BUTTONS -------------------

  // créer un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button"); 
  allButton.textContent = "Tous"; // Ajoute "Tous" au bouton
  allButton.dataset.category = "all"; // Ajoute un attribut "data-category" avec la valeur "all"
  menu.appendChild(allButton); // Ajoute le bouton au menu

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach((category) => { 
    const button = document.createElement("button"); // Crée un bouton
    button.textContent = category.name;   // Ajoute le nom de la catégorie au bouton
    button.dataset.category = category.id; // Ajoute un attribut "data-category" avec l'ID de la catégorie
    menu.appendChild(button); // Ajoute le bouton au menu
  });

  addFilterEvents(); // ajoute les actions quand on clique sur les boutons
}

// -------------------- EVENTS ----------------

// Fonction pour ajouter des événements de clic sur chaque bouton de catégorie
function addFilterEvents() { // ajouter événements de clic sur chaque bouton
  const buttons = document.querySelectorAll("#menu-categories button"); // Sélectionne tous les boutons 
  if (buttons.length === 0) { // Si aucun bouton 
    console.error("Aucun bouton de catégorie trouvé");  
    return;   
  }

  // Pour chaque bouton, on ajoute une action à faire quand on clique dessus
  buttons.forEach((button) => { // Pour chaque bouton
    button.addEventListener("click", (e) => { // écouteur d'événements au clic
      buttons.forEach((button) => { // Pour chaque bouton
        button.classList.remove("active");  // Supprime la classe "active"
      });
      e.target.classList.add("active"); // Ajoute la classe "active" au bouton cliqué
      const categoryId = button.dataset.category; // Récupère l'ID de la catégorie
      showWorks(categoryId); // Affiche les travaux de la catégorie
    });
  });
}

// --------------------------- AFFICHAGE DE LA GAlLERY ----------------

// Fonction pour afficher les travaux dans la galerie

async function showWorks(categoryId = "all") { // asynchrone afficher les travaux dans la galerie
  showWorksCallCount++; // Incrémente le compteur d'appels

  const gallery = document.querySelector(".gallery"); // Sélectionne la galerie
  if (!gallery) {   // Si la galerie pas trouvée
    console.error("La galerie est introuvable"); 
    return;  
  }

  // On vide la galerie pour ne pas mélanger les nouveaux travaux avec les anciens
  gallery.innerHTML = "";   
  // On récupère tous les travaux depuis le serveur
  const works = await getWorks(); // Récupère travaux via l'API
  if (!works) { // Si aucun travail n'est récupéré
    console.error("Aucun travail récupéré"); 
    return; 
  }

  // ----------------------- FILTRES ----------------------------

  // On filtre les travaux selon la catégorie choisie
  const filteredWorks =  // Filtre les travaux en fonction de la catégorie choisie
    categoryId === "all" // Si la catégorie est "all"
      ? works // On affiche tous les travaux
      : works.filter((work) => work.categoryId === parseInt(categoryId)); // Sinon, on filtre les travaux par catégorie

  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach((element) => { // Pour chaque travail
    let figure = document.createElement("figure"); // Crée un élément figure
    let img = document.createElement("img"); // Crée un élément img
    img.src = element.imageUrl; // Récupère l'URL de l'image
    img.alt = element.title; // Récupère le titre du travail
    let figureCaption = document.createElement("figcaption"); // Crée un élément figcaption
    figureCaption.textContent = element.title; // Récupère le titre du travail
    figure.appendChild(img); // Ajoute l'image à la figure
    figure.appendChild(figureCaption); // Ajoute la légende à la figure
    gallery.appendChild(figure); // Ajoute la figure à la galerie
  });
}

// ----------------- BARRE NOIRE EN MODE ÉDITION ------------------
function toggleEditBar() { // pour afficher ou masquer la barre d'édition
  const editBar = document.querySelector("#edit-bar"); 
  const token = localStorage.getItem("authToken"); // Récupère le token

  if (token) {  
    // Si l'utilisateur est connecté
    editBar.classList.remove("hidden"); // Affiche la barre
  } else {
    editBar.classList.add("hidden"); // Cache la barre
  }
}

// ----------------- LANCEMENT DE LA PAGE CHARGEE ----------------

// Fonction principale pour tout lancer quand la page est chargée

// Fonction d'initialisation pour afficher les catégories et les travaux
async function init() { // asynchrone pour initialiser la page
  toggleLoginLogoutButton(); // Appelle fonction pour basculer bouton Login/Logout
  await createCategoryMenu(); // Crée et affiche le menu des catégories
  await showWorks(); 

  // Réinitialise l'état du bouton
  const editButton = document.querySelector("#edit-mode"); // Sélectionne btn
  if (editButton) { // Si le bouton est trouvé
    editButton.classList.add("hidden"); // Cache le bouton par défaut
  }

  toggleAdminFeatures();  // Appelle pour afficher ou masquer les fonctionnalités admin
  toggleEditBar(); // Appelle pour afficher ou masquer la barre d'édition
}

// Appelle la fonction d'initialisation dès le chargement de la page
document.addEventListener("DOMContentLoaded", init); // Appelle la fonction init() au chargement de la page

// ----------------- INTERACTIONS UTILISATEUR ------------------

// Gestion du clic sur le bouton "Modifier"
const editModeButton = document.querySelector("#edit-mode"); // Sélectionne le bouton "Modifier"
if (editModeButton) { // Si le bouton est trouvé
  editModeButton.addEventListener("click", () => { // Ajoute un écouteur d'événements 
    // Appliquer la classe pour l'animation
    editModeButton.classList.add("animate-dissolve"); // Ajoute la classe "animate-dissolve" au bouton
    // Supprime la classe après l'animation
    setTimeout(() => { // Attend 300ms
      editModeButton.classList.remove("animate-dissolve"); // Supprime la classe "animate-dissolve"
    }, 300); // Après 300ms
    // Après l'animation, rediriger vers la nouvelle page
    setTimeout(() => { // Attend 300ms
      openModal("#gallery-modal"); // Ouvre la modale galerie
    }, 300); // Après 300ms
  });
}

// ----------------- FONCTIONNALITÉS ADMIN ---------------------
/*après init() pour etre exécuté au chargement de la page, après le contenu dynamique.*/

// Fonction pour afficher ou masquer les fonctionnalités admin
function toggleAdminFeatures() { // afficher /masquer les fonctionnalités admin
  const token = localStorage.getItem("authToken"); // Récupère le token
  const editButton = document.querySelector("#edit-mode"); // Sélectionne le bouton "Modifier"
  const filters = document.querySelector("#menu-categories"); // Sélectionne les filtres

  if (!editButton) { // Si le btn pas trouvé
    return; 
  }

  if (token) { // Si un token est présent
    editButton.classList.remove("hidden"); // Affiche le bouton
    filters.style.display = "none"; // Cache les filtres
  } else {
    editButton.classList.add("hidden"); // Cache le bouton
  }
}


// --------------------------------fonctionnalités pour la modale

// Sélection des éléments
document.addEventListener("DOMContentLoaded", () => { // Attend que le DOM soit chargé
  const modal = document.querySelector("#gallery-modal"); // Sélectionne la modale
  const openModalButton = document.querySelector("#edit-mode"); // Bouton "Modifier"
  const closeModalButton = document.querySelector(".close-modal"); // Bouton pour fermer la modale
  const modalGallery = document.querySelector(".gallery-modal"); // Galerie dans la modale

  // Fonction pour ouvrir la modale et charger les images
  function openModalGallery() {  // ouvrir la modale
    openModalGalleryCallCount++;  // Incrémente le compteur d'appels

    window.location.href = "#gallery-modal"; // Déplace la fenêtre vers la modale
    modal.classList.remove("hidden"); // Affiche la modale
    modalGallery.innerHTML = ""; 

    // Charge les images via l'API
    getWorks() // Récupère les travaux
      .then((works) => { // Si les travaux sont récupérés
        works.forEach((work) => { // Pour chaque travail
          // Crée l'élément figure pour chaque travail
          const figure = document.createElement("figure"); 

          // Crée l'icône poubelle
          const trashIcon = document.createElement("i"); // Crée un élément i
          trashIcon.className = "fa-solid fa-trash-can trash-icon"; // Ajoute des classes à l'icône

          // Ajoute un événement au clic sur l'icône poubelle
          trashIcon.addEventListener("click", async () => { // Ajoute un écouteur d'événements au clic
            if (confirm(`Voulez-vous vraiment supprimer ${work.title} ?`)) { // Demande confirmation
              try { 
                const response = await fetch( // Envoie une requête DELETE à l'URL spécifiée
                  `http://localhost:5678/api/works/${work.id}`, // URL de l'API
                  {
                    method: "DELETE", // Utilise la méthode DELETE
                    headers: { // Ajoute les headers
                      Authorization: `Bearer ${localStorage.getItem( // Ajoute le token d'authentification
                        "authToken" // Récupère le token
                      )}`,
                    },
                  }
                );

                if (response.ok) { 
                  figure.remove(); // Supprime l'élément du DOM
                  showWorks(); // Recharge les catégories et les travaux
                } else { 
                  console.error( 

                    `Erreur lors de la suppression : ${response.status}` // Message d'erreur
                  );
                }
              } catch (error) { // Gestion des erreurs
                console.error("Erreur lors de la requête DELETE :", error);
              }
            }
          });

          // Crée l'image
          const imgElement = document.createElement("img"); // Crée un élément img 
          imgElement.src = work.imageUrl; // Récupère l'URL depuis l'API
          imgElement.alt = work.title; // Récupère le titre depuis l'API

          // Ajoute les éléments aux figures
          figure.appendChild(imgElement); // Ajoute l'image à la figure 
          figure.appendChild(trashIcon); // Ajoute l'icône poubelle à la figure 

          // Ajoute la figure à la galerie
          modalGallery.appendChild(figure); // Ajoute la figure à la galerie
        });
      })
      .catch((error) => { // Gestion des erreurs
        console.error("Erreur lors de la récupération des works :", error); 
      });
  }

  // Fonction pour fermer la modale
  function closeModalGallery() { // Fonction pour fermer la modale galerie 
    modal.classList.add("hidden"); // Cache la modale galerie 
  }

  // Écouteurs d'événements
  if (openModalButton) { // Si le bouton pour ouvrir la modale est trouvé 
    openModalButton.addEventListener("click", openModalGallery); // Ajoute un écouteur d'événements au clic pour ouvrir la modale
  }

  // Fermer la modale au clic en dehors
  window.addEventListener("click", (e) => { // Ajoute un écouteur d'événements au clic sur la fenêtre 
    if (e.target === modal) { // Si la cible du clic est la modale 
      closeModalGallery(); // Ferme la modale 
    }
  });
});

// Fonction pour ouvrir une modale spécifique
function openModal(modalId) { // Fonction pour ouvrir une modale spécifique 
  const modal = document.querySelector(modalId); // Sélectionne la modale avec l'ID spécifié 
  if (modal) { // Si la modale est trouvée 
    modal.classList.remove("hidden"); // Affiche la modale 
    modal.style.display = "flex"; // Affiche la modale en flex 
  } else { // Si la modale n'est pas trouvée 
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);  
  }
}

// Fonction pour fermer une modale spécifique
function closeModal(modalId) { // Fonction pour fermer une modale spécifique
  const modal = document.querySelector(modalId); // Sélectionne la modale avec l'ID spécifié 
  if (modal) { // Si la modale est trouvée
    modal.classList.add("hidden"); // Cache la modale 
    modal.style.display = "none"; // Cache la modale 
  } else { 
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`); 
  }
}

document.addEventListener("DOMContentLoaded", async () => { // Attend que le DOM soit chargé 
  // Bouton pour ouvrir la deuxième modale depuis la première
  const addPhotoButton = document.querySelector("#add-photo"); // Sélectionne le bouton "Ajouter une photo"

  if (addPhotoButton) { // Si le bouton est trouvé 
    addPhotoButton.addEventListener("click", () => { // Ajoute un écouteur d'événements au clic
      closeModal("#gallery-modal"); // Ferme la première modale 
      openModal("#photo-modal"); // Ouvre la deuxième modale
    });
  }

  // Boutons pour fermer la deuxième modale
  const closePhotoModalButton = document.querySelector(".close-photo-modal"); // Sélectionne le bouton pour fermer la modale 
  if (closePhotoModalButton) {  // Si le bouton est trouvé 
    closePhotoModalButton.addEventListener("click", () => { // Ajoute un écouteur d'événements 
      closeModal("#photo-modal"); 
    });
  }
  // Ajout dynamique des catégories dans la deuxième modale
  const categorySelect = document.querySelector("#category"); // Sélectionne les catégories

  if (categorySelect) { // Si le select est trouvé
    try { 
      const categories = await getCategories(); // Récupère catégories via l'API
      if (categories && categories.length > 0) { // Si des catégories sont récupérées et la liste n'est pas vide 
        // Utilisation d'un Set pour éviter les doublons

        const uniqueCategoryNames = new Set(); // Crée un Set pour stocker les noms de catégories uniques 

        categories.forEach((category) => { // Pour chaque catégorie 
          if (!uniqueCategoryNames.has(category.name)) { // Si le nom de la catégorie n'est pas déjà dans le Set 
            uniqueCategoryNames.add(category.name); // Ajoute le nom de la catégorie au Set 

            const option = document.createElement("option"); // Crée un élément option 
            option.value = category.id; // Ajoute l'ID de la catégorie comme valeur 
            option.textContent = category.name; // Ajoute le nom de la catégorie comme texte 
            categorySelect.appendChild(option); // Ajoute chaque catégorie comme option
          }
        });
      } else {  // Si aucune catégorie n'est récupérée ou la liste est vide 
        console.error("Aucune catégorie récupérée ou liste vide."); 
      }
    } catch (error) { // Gestion des erreurs 
      console.error("Erreur lors de l'ajout des catégories :", error); 
    }
  } else { // Si le select n'est pas trouvé
    console.error("Élément select pour les catégories introuvable."); 
  }
});

// Prévisualisation de l'image ajoutée
document.querySelector("#image").addEventListener("change", (event) => { // écouteur d'événements au changement de l'input file 
  const previewContainer = document.querySelector("#preview-container"); // Sélectionne le conteneur de prévisualisation 
  const previewImage = document.querySelector("#image-preview"); // Sélectionne l'image de prévisualisation 

  const file = event.target.files[0]; // Récupère le fichier sélectionné 
  if (file) { // Si un fichier est sélectionné 
    const reader = new FileReader(); // Crée un objet FileReader  
    reader.onload = (e) => { // Ajoute un événement de chargement 
      previewImage.src = e.target.result; // Récupère l'URL de l'image
      previewImage.style.display = "block"; // Affiche l'image
    };
    reader.readAsDataURL(file); // Lit le fichier comme une URL
  } else {  
    // Si aucun fichier sélectionné
    previewImage.style.display = "none"; // Cache l'image 
    previewImage.src = ""; // Réinitialise l'URL de l'image 
  }
});

// Déclare toutes tes fonctions principales
function addphoto() {   
  // déclarer la fonction pour ajouter un travail 

  const form = document.querySelector("#add-project-form"); // Sélectionne le formulaire d'ajout de projet
  if (!form) { // Si le formulaire n'est pas trouvé 
    console.error("Le formulaire n'est pas trouvé !"); 
    return; 
  }

  // Sélecteurs des messages d'erreur
  const titleErrorMessage = document.querySelector( // Sélectionne le message d'erreur pour le titre 
    "#title-photo-modal + .error-message" 
  );
  const categoryErrorMessage = document.querySelector( // Sélectionne le message d'erreur pour la catégorie 
    ".field-field-category .error-message"  
  );
  const photoErrorMessage = document.querySelector( // Sélectionne le message d'erreur pour la photo 
    ".icon-and-photo-container .error-message"  
  );

  // Fonction pour mettre à jour l'état du bouton "Valider"
  function updateSubmitButtonState() { //mettre à jour l'état du bouton "Valider" 
    const titleField = document.querySelector("#title-photo-modal"); // Sélectionne le champ pour le titre 
    const categoryField = document.querySelector("#category"); // Sélectionne le champ pour la catégorie 
    const imageField = document.querySelector("#image"); // Sélectionne le champ pour l'image 
    const submitButton = document.querySelector("#submit-photo"); // Sélectionne le bouton "Valider" 
    const message = document.querySelector(".error-message"); // Sélectionne le message d'erreur
    // Vérifie si tous les champs sont remplis
    const isTitleFilled = titleField.value.trim() !== "";  // Vérifie si le titre est rempli
    const isCategorySelected = categoryField.value !== ""; // Vérifie si une catégorie est sélectionnée
    const isImageAdded = imageField.files.length > 0; // Vérifie si une image est ajoutée

    // Active/désactive le bouton en fonction des champs remplis
    if (isTitleFilled && isCategorySelected && isImageAdded) { // Si tous les champs sont remplis 
      submitButton.disabled = false; // Active le bouton 
      submitButton.style.backgroundColor = "#1d6154"; // Passe au vert
      message.style.display = "none"; // Cache le message d'erreur 
    } else { 
      submitButton.disabled = true; // Désactive le bouton 
      submitButton.style.backgroundColor = "#a7a7a7"; // Reste grisé
      message.style.display = "block"; // Affiche le message d'erreur 
    }
  }

  // Ajoute des écouteurs pour surveiller les champs
  document 
    .querySelector("#title-photo-modal") // Sélectionne le champ pour le titre 
    .addEventListener("input", updateSubmitButtonState); // Ajoute un écouteur d'événements pour surveiller les changements 
  document 
    .querySelector("#category") // Sélectionne le champ pour la catégorie
    .addEventListener("change", updateSubmitButtonState); // Ajoute un écouteur d'événements 
  document 
    .querySelector("#image") // Sélectionne le champ pour l'image
    .addEventListener("change", updateSubmitButtonState); // Ajoute un écouteur d'événements 

  // Appelle une première fois pour initialiser l'état du bouton
  updateSubmitButtonState(); // Appelle la fonction pour mettre à jour l'état du bouton

  //  écouteur d'événements pour le formulaire
  form.addEventListener("submit", async (event) => { // Ajoute un écouteur d'événements  
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Sélecteurs des champs du formulaire 
    const titleField = document.querySelector("#title-photo-modal"); // Sélectionne le champ pour le titre 
    const categoryField = document.querySelector("#category"); // Sélectionne le champ pour la catégorie
    const imageField = document.querySelector("#image"); // Sélectionne le champ pour l'image
    const submitButton = document.querySelector("#submit-photo"); // Sélectionne le bouton "Valider"

    // Récupère les données du formulaire 
    const formData = new FormData(form); 

    // Récupère le token pour l'authentification
    const token = localStorage.getItem("authToken"); // Récupère le token

    try {  
      
      // Envoie les données au serveur 
      const response = await fetch("http://localhost:5678/api/works", {  
        // Envoie les données au serveur
        method: "POST",  
        headers: { // Ajoute les headers 
          
          Authorization: `Bearer ${token}`, // Ajoute le token d'authentification
        },
        body: formData, // Contient l'image et les autres champs
      });

      if (response.ok) {  
        // Si la réponse est ok
        const newWork = await response.json(); // Récupère le travail ajouté

        // Ajoute le travail à la galerie
        addWorkToGallery(newWork); 
        closeModal("#photo-modal"); // Ferme la modale 
        showWorks(); // Recharge les catégories et les travaux 
      } else {  
       
        console.error(`Erreur lors de l'ajout : ${response.status}`); // Affiche le statut de la réponse
        // Crée un message d'erreur visible dans le formulaire
        const errorBox = document.createElement("div"); // Crée une div pour le message d'erreur 
        errorBox.className = "error-login"; // Ajoute une classe à la div 
        errorBox.textContent = `Erreur ${response.status} : Impossible d'ajouter la photo.`;  

        // Ajoute ce message
        const form = document.querySelector("#add-project-form"); // Sélectionne le formulaire 
        form.prepend(errorBox); // Ajoute le message d'erreur au début du formulaire 
      }
    } catch (error) { 
      // Si une erreur se produit
      console.error("Erreur lors de l'envoi des données", error); // Affiche l'erreur
    }
  });
}

// Fonction pour ajouter un travail à la galerie
function addWorkToGallery(work) { 
  const gallery = document.querySelector(".gallery"); // Sélectionne la galerie 
  if (!gallery) { // Si la galerie n'est pas trouvée 
    console.error("Galerie introuvable !"); 
    return; 
  }

  // Vérifie si l'image existe déjà dans la galerie
  const existingImages = Array.from(gallery.querySelectorAll("img")); // Sélectionne toutes les images
  const isDuplicate = existingImages.some((img) => img.src === work.imageUrl); 

  // Vérifie si l'image est déjà présente
  if (isDuplicate) { // Si l'image est déjà présente 
    console.warn("Image déjà existante dans la galerie :", work.imageUrl); // Affiche un avertissement dans la console 
    return;
  }

  // Crée un élément figure pour le travail
  const figure = document.createElement("figure"); // Crée une figure

  const img = document.createElement("img"); // Crée une image
  img.src = work.imageUrl; // Récupère l'URL de l'image
  img.alt = work.title; // Récupère le titre du travail

  const figcaption = document.createElement("figcaption"); // Crée une légende
  figcaption.textContent = work.title; // Récupère le titre du travail

  // Ajoute l'image et la légende à la figure
  figure.appendChild(img); // Ajoute l'image à la figure
  figure.appendChild(figcaption); // Ajoute la légende à la figure

  // Ajoute la figure à la galerie
  gallery.appendChild(figure);
}

addphoto(); // Appel de la fonction pour ajouter un travail

// ------------------- FORMULAIRE DE CONTACT -------------------

// Sélectionner le formulaire dans la section contact
const contactForm = document.querySelector("#contact form");

// Vérifie que le formulaire existe
if (contactForm) {
  // Ajouter un événement sur la soumission du formulaire
  contactForm.addEventListener("submit", (event) => {   // Ajoute un écouteur d'événements 
    event.preventDefault(); 

    // Sélectionner les champs
    const name = document.querySelector("#name").value.trim(); // Sélectionne le champ pour le nom 
    const email = document.querySelector("#email").value.trim(); // Sélectionne le champ pour l'email
    const message = document.querySelector("#message").value.trim(); // Sélectionne le champ pour le message

    // Validation des champs
    if (!name || !email || !message) { // Si un champ est vide 
      alert("Tous les champs doivent être remplis !"); // Affiche une alerte 

      return; 
    }

    // Simulation d'envoi

    alert("Message envoyé avec succès !"); // Affiche une alerte 
  });
}
