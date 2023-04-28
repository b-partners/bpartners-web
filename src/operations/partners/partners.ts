import BREAD_LOGO from 'src/assets/logo-bred.png';
import BREAD_ASSURANCE_LOGO from 'src/assets/logo-bred-assurance.png';

type Partner = {
  name: string;
  message: string;
  imageSrc: string;
  phone: string;
  email: string;
};

export const partners: Partner[] = [
  {
    name: 'Laetitia DRONIOU',
    message: "Besoin d'un compte bancaire ?",
    imageSrc: BREAD_LOGO,
    phone: '01.40.04.77.07',
    email: 'laetitia.droniou@bred.fr',
  },
  {
    name: 'Laetitia DRONIOU',
    message: "Besoin d'assurer votre activité au meilleur tarif ?",
    imageSrc: BREAD_ASSURANCE_LOGO,
    phone: '01.40.04.77.07',
    email: 'laetitia.droniou@bred.fr',
  },
];
