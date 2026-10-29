import { ContactLink, LegalDoc, LegalSection } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

const Privacy = () => (
  <LegalDoc
    title="Politique de confidentialité"
    description="Quelles données CulturHist collecte, pourquoi, avec qui elles sont partagées et comment exercer vos droits."
  >
    <p className="text-[15px] leading-relaxed text-foreground/90">
      Cette page explique quelles données {LEGAL.site} utilise, pourquoi, et comment garder la main dessus. Le
      responsable du traitement est {LEGAL.publisher}, joignable à <ContactLink />.
    </p>

    <LegalSection title="1. Les données que nous utilisons">
      <ul>
        <li>
          <strong>Votre compte</strong> : adresse e-mail et pseudo. Si vous vous connectez avec Apple ou Google, nous
          recevons aussi le nom et l'adresse e-mail que vous acceptez de partager (Apple permet de masquer l'adresse).
        </li>
        <li>
          <strong>Vos réponses au démarrage</strong> : profil, motivation, régions, époques et niveau préférés.
        </li>
        <li>
          <strong>Votre progression</strong> : points, série de jours, faits découverts, résultats des quiz, favoris,
          compagnon choisi.
        </li>
        <li>
          <strong>Vos notifications</strong> : réglages et heures choisis, fuseau horaire, et l'abonnement technique de
          votre appareil si vous activez les notifications.
        </li>
        <li>
          <strong>Données techniques</strong> : adresse IP et type de navigateur, enregistrés dans les journaux de
          l'hébergeur pour la sécurité du service.
        </li>
      </ul>
      <p>Nous ne vendons aucune donnée et ne demandons jamais d'informations sensibles.</p>
    </LegalSection>

    <LegalSection title="2. Pourquoi">
      <ul>
        <li>
          Faire fonctionner votre compte, vos faits du jour, vos quiz et votre série : c'est l'exécution du service que
          vous utilisez (contrat).
        </li>
        <li>Vous envoyer des rappels, seulement si vous les activez : votre consentement, retirable à tout moment.</li>
        <li>
          Afficher des publicités pour financer l'application gratuite : personnalisées seulement si vous l'acceptez
          (consentement), sinon non personnalisées.
        </li>
        <li>Protéger le service contre les abus : notre intérêt légitime.</li>
      </ul>
    </LegalSection>

    <LegalSection title="3. Avec qui">
      <p>Vos données ne sont partagées qu'avec les prestataires nécessaires au service :</p>
      <ul>
        <li>
          <strong>Supabase</strong> : base de données et comptes.
        </li>
        <li>
          <strong>Vercel</strong> : hébergement du site.
        </li>
        <li>
          <strong>Google</strong> : publicité (Google AdSense), polices de caractères (Google Fonts) et connexion avec
          Google si vous la choisissez.
        </li>
        <li>
          <strong>Apple</strong> : connexion avec Apple si vous la choisissez.
        </li>
        <li>
          <strong>Wikimédia</strong> : votre navigateur charge depuis Wikipédia les événements « Ce jour-là » et des
          images de Wikimedia Commons.
        </li>
        <li>
          Les services de notification de votre navigateur (Apple, Google ou Mozilla) transmettent les rappels si vous
          les activez.
        </li>
      </ul>
      <p>
        Certains de ces prestataires sont situés hors de l'Union européenne, notamment aux États-Unis. Ces transferts
        sont encadrés par les clauses contractuelles types de la Commission européenne ou par le cadre de protection des
        données UE–États-Unis.
      </p>
    </LegalSection>

    <LegalSection title="4. Cookies et stockage sur votre appareil">
      <ul>
        <li>
          <strong>Nécessaires</strong> : votre session de connexion et quelques préférences de l'application sont
          gardées dans le stockage de votre navigateur. Sans eux, l'application ne fonctionne pas : ils ne demandent pas
          de consentement.
        </li>
        <li>
          <strong>Publicité</strong> : Google AdSense peut déposer des cookies pour mesurer et personnaliser les
          annonces. Un message vous demande votre choix lors de votre première visite ; vous pouvez le modifier ensuite
          depuis ce même message. Pour en savoir plus :{" "}
          <a href="https://policies.google.com/technologies/partner-sites?hl=fr">
            comment Google utilise les données des sites partenaires
          </a>
          .
        </li>
      </ul>
    </LegalSection>

    <LegalSection title="5. Combien de temps">
      <p>
        Vos données sont gardées tant que votre compte existe. Si vous le supprimez (Profil, Réglages, « Supprimer mon
        compte »), votre compte et toutes les données qui y sont liées sont effacés immédiatement. Les journaux
        techniques de l'hébergeur sont effacés automatiquement après quelques semaines.
      </p>
    </LegalSection>

    <LegalSection title="6. Vos droits">
      <p>
        Vous pouvez accéder à vos données, les corriger, les effacer, en demander une copie, vous opposer à leur
        utilisation ou retirer votre consentement. Le pseudo, l'e-mail, les préférences et la suppression du compte se
        gèrent directement dans les Réglages ; pour le reste, écrivez à <ContactLink />. Nous répondons sous un mois.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la{" "}
        <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
      </p>
    </LegalSection>

    <LegalSection title="7. Âge minimum">
      <p>
        {LEGAL.site} est destiné aux personnes de 15 ans et plus. En dessous, l'accord d'un parent est nécessaire pour
        créer un compte.
      </p>
    </LegalSection>

    <LegalSection title="8. Modifications">
      <p>
        Si cette politique change de façon importante, nous vous en informerons dans l'application. La date de
        dernière mise à jour figure en haut de cette page.
      </p>
    </LegalSection>
  </LegalDoc>
);

export default Privacy;
