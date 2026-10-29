import { Link } from "react-router-dom";
import { ContactLink, LegalDoc, LegalSection } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

const Terms = () => (
  <LegalDoc
    title="Conditions d'utilisation"
    description="Les règles d'utilisation de l'application CulturHist : compte, contenus, responsabilités."
  >
    <p className="text-[15px] leading-relaxed text-foreground/90">
      Ces conditions encadrent l'utilisation de {LEGAL.site}, édité par {LEGAL.publisher} (voir les{" "}
      <Link to="/mentions-legales">mentions légales</Link>). En créant un compte, vous les acceptez.
    </p>

    <LegalSection title="1. Le service">
      <p>
        {LEGAL.site} propose chaque jour des faits historiques, des quiz, une citation et des événements « Ce jour-là »,
        avec un suivi de progression et des rappels. L'application est gratuite et financée par la publicité. Ses
        fonctionnalités peuvent évoluer.
      </p>
    </LegalSection>

    <LegalSection title="2. Votre compte">
      <ul>
        <li>Vous créez un compte avec Apple, Google ou une adresse e-mail et un mot de passe.</li>
        <li>Vous êtes responsable de la confidentialité de votre mot de passe et de ce qui se fait avec votre compte.</li>
        <li>
          Votre pseudo ne doit pas usurper l'identité de quelqu'un, ni être injurieux, haineux ou contraire à la loi.
        </li>
        <li>Il faut avoir 15 ans, ou l'accord d'un parent en dessous.</li>
      </ul>
    </LegalSection>

    <LegalSection title="3. Bon usage">
      <p>
        Vous vous engagez à ne pas perturber le service, ni tenter d'accéder aux données d'autres personnes, ni
        automatiser l'obtention de points ou copier massivement les contenus. En cas d'abus, le compte concerné peut être
        suspendu ou supprimé.
      </p>
    </LegalSection>

    <LegalSection title="4. Les contenus">
      <p>
        Les faits sont rédigés avec soin à partir de sources citées sur chaque fiche, principalement Wikipédia. Ils sont
        proposés pour la culture générale : malgré nos vérifications, une erreur reste possible. Si vous en repérez une,
        écrivez-nous à <ContactLink />, nous la corrigerons.
      </p>
      <p>
        Les textes, l'interface et les personnages de {LEGAL.site} sont protégés. Les images gardent leurs propres
        auteurs et licences, indiqués sous chacune.
      </p>
    </LegalSection>

    <LegalSection title="5. Responsabilité">
      <p>
        Nous faisons notre possible pour que l'application soit disponible et fiable, sans pouvoir le garantir en
        permanence. Une maintenance ou une panne peut l'interrompre. Les liens vers des sites extérieurs sont fournis par
        commodité ; nous ne sommes pas responsables de leur contenu.
      </p>
    </LegalSection>

    <LegalSection title="6. Fin d'utilisation">
      <p>
        Vous pouvez arrêter à tout moment et supprimer votre compte dans Profil, Réglages, « Supprimer mon compte » :
        vos données sont alors effacées (voir la <Link to="/confidentialite">politique de confidentialité</Link>).
      </p>
    </LegalSection>

    <LegalSection title="7. Modifications et droit applicable">
      <p>
        Ces conditions peuvent évoluer ; en cas de changement important, vous en serez informé dans l'application. Elles
        sont soumises au droit français. En cas de désaccord, écrivez-nous d'abord à <ContactLink /> pour trouver une
        solution amiable.
      </p>
    </LegalSection>
  </LegalDoc>
);

export default Terms;
