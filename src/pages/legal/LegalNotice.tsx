import { Link } from "react-router-dom";
import { ContactLink, LegalDoc, LegalSection } from "@/components/LegalDoc";
import { LEGAL } from "@/lib/legal";

const LegalNotice = () => (
  <LegalDoc title="Mentions légales" description="Éditeur, hébergeur et crédits du site CulturHist.">
    <LegalSection title="Éditeur">
      <p>
        Le site {LEGAL.url.replace("https://", "")} et l'application {LEGAL.site} sont édités par {LEGAL.publisher},{" "}
        {LEGAL.publisherStatus}.
      </p>
      <p>
        Contact : <ContactLink />
      </p>
      <p>Directeur de la publication : {LEGAL.publisher}.</p>
    </LegalSection>

    <LegalSection title="Hébergement">
      <p>
        Le site est hébergé par <a href={LEGAL.host.url}>{LEGAL.host.name}</a>, {LEGAL.host.address}.
      </p>
      <p>
        Les comptes et les données de l'application sont hébergés par{" "}
        <a href={LEGAL.dataHost.url}>{LEGAL.dataHost.name}</a>, qui fournit la base de données et l'authentification.
      </p>
    </LegalSection>

    <LegalSection title="Propriété intellectuelle">
      <p>
        Les textes, l'interface, le logo et les personnages illustrés de {LEGAL.site} appartiennent à leur éditeur. Toute
        reproduction sans autorisation est interdite, sauf courte citation avec la source.
      </p>
      <p>
        Les images des faits historiques viennent de Wikimedia Commons. Chacune garde son auteur et sa licence, indiqués
        sous l'image avec un lien vers sa page d'origine. Les textes des faits sont rédigés à partir des articles de
        Wikipédia cités en source, sous licence CC BY-SA. Les événements « Ce jour-là » qui ne viennent pas de nos fiches
        sont fournis par Wikipédia.
      </p>
    </LegalSection>

    <LegalSection title="Données personnelles">
      <p>
        Voir la <Link to="/confidentialite">politique de confidentialité</Link> et les{" "}
        <Link to="/conditions">conditions d'utilisation</Link>.
      </p>
    </LegalSection>
  </LegalDoc>
);

export default LegalNotice;
