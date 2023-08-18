export const BpFrenchMessages = {
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
  },
};
