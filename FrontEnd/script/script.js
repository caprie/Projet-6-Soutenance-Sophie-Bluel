let openModalGalleryCallCount = 0; // Variable globale pour compter les appels
let showWorksCallCount = 0; // Variable globale pour compter les appels

//----------RECUPERATION DES API ----------

// Fonction pour récupérer les TRAVAUX depuis l'API
async function getWorks() {
  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Erreur lors de la récupération des works :", error.message);
  }
}

// Fonction pour récupérer les CATEGORIES depuis l'API
async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }
    // Convertit les données de la réponse en JSON pour les rendre utilisables
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories :",
      error.message
    );
  }
}

//---------------------STYLE DYNAMIQUE BTN NAV  --------------------

const links = document.querySelectorAll("nav a");

const currentPath = window.location.href; //recupere l'url de la page affichée

links.forEach((link) => {
  if (currentPath === link.href) {
    link.classList.add("active");
  }
});

//------------------- style logout -----------------
// Fonction pour basculer le texte et l'action du bouton Login/Logout
function toggleLoginLogoutButton() {
  const loginLogoutButton = document.getElementById("loginLogoutButton");

  if (loginLogoutButton) {
    if (localStorage.getItem("authToken")) {
      loginLogoutButton.textContent = "Logout";
      loginLogoutButton.onclick = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/FrontEnd/login.html";
      };
    } else {
      loginLogoutButton.textContent = "Login";
      loginLogoutButton.onclick = () => {
        window.location.href = "/FrontEnd/login.html";
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
async function createCategoryMenu() {
  // Récupère les catégories depuis l'API
  const categories = await getCategories();
  if (!categories) {
    console.error("Pas de catégories récupérées");
    return;
  }

  // --------------------- AJOUT DES BUTTONS ET CATEGORIES --------------------

  // -------------------- CONTAINER ------------------------

  const portfolioSection = document.querySelector("#portfolio");
  const menu = document.createElement("div");
  menu.id = "menu-categories";
  portfolioSection.insertBefore(
    menu,
    portfolioSection.querySelector(".gallery")
  );

  // ---------------------------- BUTTONS -------------------

  // créer un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.dataset.category = "all";
  menu.appendChild(allButton);

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.category = category.id;
    menu.appendChild(button);
  });

  addFilterEvents(); // ajoute les actions quand on clique sur les boutons
}

// -------------------- EVENTS ----------------

// Fonction pour ajouter des événements de clic sur chaque bouton de catégorie
function addFilterEvents() {
  const buttons = document.querySelectorAll("#menu-categories button");
  if (buttons.length === 0) {
    console.error("Aucun bouton de catégorie trouvé");
    return;
  }

  // Pour chaque bouton, on ajoute une action à faire quand on clique dessus
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      buttons.forEach((button) => {
        button.classList.remove("active");
      });
      e.target.classList.add("active");
      const categoryId = button.dataset.category;
      showWorks(categoryId);
    });
  });
}

// --------------------------- AFFICHAGE DE LA GAlLERY ----------------

// Fonction pour afficher les travaux dans la galerie

async function showWorks(categoryId = "all") {
  showWorksCallCount++;

  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.error("La galerie est introuvable");
    return;
  }

  // On vide la galerie pour ne pas mélanger les nouveaux travaux avec les anciens
  gallery.innerHTML = "";
  // On récupère tous les travaux depuis le serveur
  const works = await getWorks();
  if (!works) {
    console.error("Aucun travail récupéré");
    return;
  }

  // ----------------------- FILTRES ----------------------------

  // On filtre les travaux selon la catégorie choisie
  const filteredWorks =
    categoryId === "all"
      ? works
      : works.filter((work) => work.categoryId === parseInt(categoryId));

  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach((element) => {
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src = element.imageUrl;
    img.alt = element.title;
    let figureCaption = document.createElement("figcaption");
    figureCaption.textContent = element.title;
    figure.appendChild(img);
    figure.appendChild(figureCaption);
    gallery.appendChild(figure);
  });
}

// ----------------- BARRE NOIRE EN MODE ÉDITION ------------------
function toggleEditBar() {
  const editBar = document.querySelector("#edit-bar");
  const token = localStorage.getItem("authToken");

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
async function init() {
  toggleLoginLogoutButton();
  await createCategoryMenu();
  await showWorks();

  // Réinitialise l'état du bouton
  const editButton = document.querySelector("#edit-mode");
  if (editButton) {
    editButton.classList.add("hidden"); // Cache le bouton par défaut
  }

  toggleAdminFeatures();
  toggleEditBar();
}

// Appelle la fonction d'initialisation dès le chargement de la page
document.addEventListener("DOMContentLoaded", init);

// ----------------- INTERACTIONS UTILISATEUR ------------------

// Gestion du clic sur le bouton "Modifier"
const editModeButton = document.querySelector("#edit-mode");
if (editModeButton) {
  editModeButton.addEventListener("click", () => {
    // Appliquer la classe pour l'animation
    editModeButton.classList.add("animate-dissolve");
    // Supprime la classe après l'animation
    setTimeout(() => {
      editModeButton.classList.remove("animate-dissolve");
    }, 300);
    // Après l'animation, rediriger vers la nouvelle page
    setTimeout(() => {
      openModal("#gallery-modal"); // Ouvre la modale galerie
    }, 300);
  });
}

// ----------------- FONCTIONNALITÉS ADMIN ---------------------
/*après init() pour etre exécuté au chargement de la page, après le contenu dynamique.*/

// Fonction pour afficher ou masquer les fonctionnalités admin
function toggleAdminFeatures() {
  const token = localStorage.getItem("authToken");
  const editButton = document.querySelector("#edit-mode");
  const filters = document.querySelector("#menu-categories");

  if (!editButton) {
    return; // Arrête la fonction ici si l'élément n'existe pas
  }

  if (token) {
    editButton.classList.remove("hidden");
    filters.style.display = "none";
  } else {
    editButton.classList.add("hidden");
  }
  // Vérifie l'état actuel du bouton
}

/*nst editModeButton = document.querySelector("#edit-mode");
if (editModeButton) {
  editModeButton.addEventListener("click", () => {
    // Appliquer la classe pour l'animation
    editModeButton.classList.add("animate-dissolve");

    // Après l'animation, rediriger vers la nouvelle page
    setTimeout(() => {
      openModal("#gallery-modal"); // Ouvre la modale galerie
    }, 300);
  });
}*/

// --------------------------------fonctionnalités pour la modale

// Sélection des éléments
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#gallery-modal");
  const openModalButton = document.querySelector("#edit-mode"); // Bouton "Modifier"
  const closeModalButton = document.querySelector(".close-modal");
  const modalGallery = document.querySelector(".gallery-modal");

  // Fonction pour ouvrir la modale et charger les images
  function openModalGallery() {
    openModalGalleryCallCount++;

    window.location.href = "#gallery-modal"; // Déplace la fenêtre vers la modale
    modal.classList.remove("hidden");
    modalGallery.innerHTML = "";

    // Charge les images via l'API
    getWorks() // Récupère les travaux
      .then((works) => {
        works.forEach((work) => {
          // Crée l'élément figure pour chaque travail
          const figure = document.createElement("figure");

          // Crée l'icône poubelle
          const trashIcon = document.createElement("i");
          trashIcon.className = "fa-solid fa-trash-can trash-icon";

          // Ajoute un événement au clic sur l'icône poubelle
          trashIcon.addEventListener("click", async () => {
            if (confirm(`Voulez-vous vraiment supprimer ${work.title} ?`)) {
              try {
                const response = await fetch(
                  `http://localhost:5678/api/works/${work.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "authToken"
                      )}`,
                    },
                  }
                );

                if (response.ok) {
                  figure.remove(); // Supprime l'élément du DOM
                  showWorks(); // Recharge les catégories et les travaux
                } else {
                  console.error(
                    `Erreur lors de la suppression : ${response.status}`
                  );
                }
              } catch (error) {
                console.error("Erreur lors de la requête DELETE :", error);
              }
            }
          });

          // Crée l'image
          const imgElement = document.createElement("img");
          imgElement.src = work.imageUrl;
          imgElement.alt = work.title;

          // Ajoute les éléments aux figures
          figure.appendChild(imgElement);
          figure.appendChild(trashIcon);

          // Ajoute la figure à la galerie
          modalGallery.appendChild(figure);
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des works :", error);
      });
  }

  // Fonction pour fermer la modale
  function closeModalGallery() {
    modal.classList.add("hidden");
  }

  // Écouteurs d'événements
  if (openModalButton) {
    openModalButton.addEventListener("click", openModalGallery);
  }

  // Fermer la modale au clic en dehors
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalGallery();
    }
  });
});

// Fonction pour ouvrir une modale spécifique
function openModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

// Fonction pour fermer une modale spécifique
function closeModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Bouton pour ouvrir la deuxième modale depuis la première
  const addPhotoButton = document.querySelector("#add-photo");

  if (addPhotoButton) {
    addPhotoButton.addEventListener("click", () => {
      closeModal("#gallery-modal"); // Ferme la première modale
      openModal("#photo-modal"); // Ouvre la deuxième modale
    });
  }

  // Boutons pour fermer la deuxième modale
  const closePhotoModalButton = document.querySelector(".close-photo-modal");
  if (closePhotoModalButton) {
    closePhotoModalButton.addEventListener("click", () => {
      closeModal("#photo-modal");
    });
  }
  // Ajout dynamique des catégories dans la deuxième modale
  const categorySelect = document.querySelector("#category");

  if (categorySelect) {
    try {
      const categories = await getCategories(); // Récupère les catégories via l'API
      if (categories && categories.length > 0) {
        // Utilisation d'un Set pour éviter les doublons

        const uniqueCategoryNames = new Set();

        categories.forEach((category) => {
          if (!uniqueCategoryNames.has(category.name)) {
            uniqueCategoryNames.add(category.name);

            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option); // Ajoute chaque catégorie comme option
          }
        });
      } else {
        console.error("Aucune catégorie récupérée ou liste vide.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout des catégories :", error);
    }
  } else {
    console.error("Élément select pour les catégories introuvable.");
  }
});

// Prévisualisation de l'image ajoutée
document.querySelector("#image").addEventListener("change", (event) => {
  const previewContainer = document.querySelector("#preview-container");
  const previewImage = document.querySelector("#image-preview");

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result; // Récupère l'URL de l'image
      previewImage.style.display = "block"; // Affiche l'image
    };
    reader.readAsDataURL(file); // Lit le fichier comme une URL
  } else {
    // Si aucun fichier sélectionné
    previewImage.style.display = "none";
    previewImage.src = "";
  }
});

// Déclare toutes tes fonctions principales
function addphoto() {
  // déclarer la fonction

  const form = document.querySelector("#add-project-form"); // Sélectionne le formulaire
  if (!form) {
    console.error("Le formulaire n'est pas trouvé !");
    return; // Arrête la fonction ici
  }

  // Sélecteurs des messages d'erreur
  const titleErrorMessage = document.querySelector(
    "#title-photo-modal + .error-message"
  );
  const categoryErrorMessage = document.querySelector(
    ".field-field-category .error-message"
  );
  const photoErrorMessage = document.querySelector(
    ".icon-and-photo-container .error-message"
  );

  // Fonction pour mettre à jour l'état du bouton "Valider"
  function updateSubmitButtonState() {
    const titleField = document.querySelector("#title-photo-modal");
    const categoryField = document.querySelector("#category");
    const imageField = document.querySelector("#image");
    const submitButton = document.querySelector("#submit-photo");
    const message = document.querySelector(".error-message");
    // Vérifie si tous les champs sont remplis
    const isTitleFilled = titleField.value.trim() !== "";
    const isCategorySelected = categoryField.value !== "";
    const isImageAdded = imageField.files.length > 0;

    // Active/désactive le bouton en fonction des champs remplis
    if (isTitleFilled && isCategorySelected && isImageAdded) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#1d6154"; // Passe au vert
      message.style.display = "none";
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#a7a7a7"; // Reste grisé
      message.style.display = "block";
    }
  }

  // Ajoute des écouteurs pour surveiller les champs
  document
    .querySelector("#title-photo-modal")
    .addEventListener("input", updateSubmitButtonState);
  document
    .querySelector("#category")
    .addEventListener("change", updateSubmitButtonState);
  document
    .querySelector("#image")
    .addEventListener("change", updateSubmitButtonState);

  // Appelle une première fois pour initialiser l'état du bouton
  updateSubmitButtonState();

  //  écouteur d'événements pour le formulaire
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le comportement par défaut

    // Sélecteurs des champs
    const titleField = document.querySelector("#title-photo-modal");
    const categoryField = document.querySelector("#category");
    const imageField = document.querySelector("#image");
    const submitButton = document.querySelector("#submit-photo");

    // Récupère les données du formulaire
    const formData = new FormData(form); // Récupère les données du formulaire

    // Récupère le token pour l'authentification
    const token = localStorage.getItem("authToken"); // Récupère le token

    try {
      // Ajoute un bloc try...catch pour gérer les erreurs
      // Envoie les données au serveur
      const response = await fetch("http://localhost:5678/api/works", {
        // Envoie les données au serveur
        method: "POST", // Utilise la méthode POST
        headers: {
          // Ajoute les headers
          Authorization: `Bearer ${token}`, // Ajoute le token d'authentification
        },
        body: formData, // Contient l'image et les autres champs
      });

      if (response.ok) {
        // Si la réponse est ok
        const newWork = await response.json(); // Récupère le travail ajouté

        // Ajoute le travail à la galerie
        addWorkToGallery(newWork);
        closeModal("#photo-modal");
        showWorks(); // Recharge les catégories et les travaux
      } else {
        // Si la réponse n'est pas ok
        console.error(`Erreur lors de l'ajout : ${response.status}`); // Affiche le statut de la réponse
        // Crée un message d'erreur visible dans le formulaire
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.textContent = `Erreur ${response.status} : Impossible d'ajouter la photo.`;

        // Ajoute ce message
        const form = document.querySelector("#add-project-form");
        form.prepend(errorBox);
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
  if (!gallery) {
    console.error("Galerie introuvable !");
    return; // Arrête la fonction ici pour éviter les erreurs
  }

  // Vérifie si l'image existe déjà dans la galerie
  const existingImages = Array.from(gallery.querySelectorAll("img")); // Sélectionne toutes les images
  const isDuplicate = existingImages.some((img) => img.src === work.imageUrl);

  // Vérifie si l'image est déjà présente
  if (isDuplicate) {
    console.warn("Image déjà existante dans la galerie :", work.imageUrl);
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
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Empêche le comportement par défaut

    // Sélectionner les champs
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    // Validation des champs
    if (!name || !email || !message) {
      alert("Tous les champs doivent être remplis !");

      return;
    }

    // Simulation d'envoi

    alert("Message envoyé avec succès !");
  });
}
