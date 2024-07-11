const DownloadAppBanner = () => {
  return (
    <div>
      <h1 style={{ fontSize: '20px' }}>
        Pour plus de confort,
        <br /> télécharger notre application mobile !
      </h1>
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}
      >
        <a href='https://play.google.com/store/apps/details?id=com.bpartnersmobile&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
          <img
            alt='Disponible sur Google Play'
            src='https://play.google.com/intl/en_us/badges/static/images/badges/fr_badge_web_generic.png'
            style={{
              width: '145px',
            }}
          />
        </a>
        <a href='https://apps.apple.com/us/app/bpartners/id1668044300?itsct=apps_box_badge&amp;itscg=30200'>
          <img
            src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/fr-fr?size=250x83&amp;releaseDate=1680220800'
            alt="Télécharger sur l'App Store"
            style={{
              borderRadius: '5px',
              height: '45px',
              width: '145px',
            }}
          />
        </a>
      </div>
    </div>
  );
};

export default DownloadAppBanner;
