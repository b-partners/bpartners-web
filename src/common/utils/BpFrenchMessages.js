export const BpFrenchMessages = {
  bp: {
    action: {
      sync: 'Synchroniser',
      finish: 'Terminer',
      next: 'Suivant',
      notNow: 'Pas maintenant',
    },
  },
  resources: {
    products: {
      name: 'Produit |||| Produits',
    },
    customers: {
      name: 'Client |||| Clients',
    },
    transactions: {
      category: { add: 'La catégorie a bien été ajoutée', edit: 'La catégorie a bien été modifiée' },
    },
    calendar: {
      name: 'Mon agenda',
      values: {
        participant: 'Participant |||| Participants',
      },
    },
    invoices: {
      name: 'Facture |||| Factures',
      status: {
        draft: 'Brouillon |||| Brouillons',
        proposal: 'Devis |||| Devis',
        confirmed: 'Facture |||| Factures',
        paid: 'Facture |||| Factures',
      },
      conversion: {
        CONFIRMED: {
          title: 'Transformer en facture',
          success: 'Devis confirmé !',
        },
        PROPOSAL: {
          title: 'Convertir en devis',
          success: 'Brouillon transformé en devis !',
        },
        PAID: {
          title: 'Marquer comme payée',
          success: 'Facture payée !',
        },
      },
    },
    prospects: {
      evaluation: {
        success: 'Évaluation des prospects réussie',
        warning: 'La réponse est vide : veuillez vérifier vos paramètres',
      },
      values: {
        artisan: 'Propriétaire artisan',
      },
      import: {
        success: 'Prospects importés avec succès',
      },
    },
  },
  messages: {
    disconnection: {
      success: 'Déconnexion effectuer avec succès.',
    },
    global: {
      error: "Une erreur s'est produite.",
      changesSaved: 'Changement enregistré',
    },
    feedback: {
      success: 'Demande envoyée avec succès.',
      error: "La demande n'as pas pu être envoyée.",
    },
    download: {
      start: 'Téléchargement en cours...',
    },
    export: {
      success: 'Exportation effectuée avec succès.',
      error: "Une erreur s'est produite lors de l'exportation.",
    },
  },
};
