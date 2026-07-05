<template>
  <div class="legal-page section">
    <div class="container-sm">
      <h1 class="display-md mb-7">Mentions légales</h1>

      <div class="legal-block">
        <h2>Éditeur du site</h2>
        <p>Le site <strong>dawky.fr</strong> est édité par la société Dawky SAS, société par actions simplifiée au capital de 1 000 €.</p>
        <ul>
          <li>Adresse : France</li>
          <li>Email : <a href="mailto:contact.dawky@gmail.com">contact.dawky@gmail.com</a></li>
          <li>SIRET : En cours d'immatriculation</li>
        </ul>
      </div>

      <div class="legal-block">
        <h2>Hébergement</h2>
        <p>Le site est hébergé par Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, USA.</p>
      </div>

      <div class="legal-block">
        <h2>Propriété intellectuelle</h2>
        <p>L'ensemble des contenus présents sur le site dawky.fr (textes, images, logos, illustrations) sont protégés par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
      </div>

      <div class="legal-block">
        <h2>Données personnelles</h2>
        <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact.dawky@gmail.com">contact.dawky@gmail.com</a>.</p>
        <p>Les données collectées (nom, email, adresse) sont utilisées exclusivement pour la gestion de vos commandes et abonnements. Elles ne sont jamais revendues à des tiers.</p>
      </div>

      <div class="legal-block">
        <h2>Cookies</h2>
        <p>Le site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
      </div>

      <div class="legal-block">
        <h2>Responsabilité</h2>
        <p>Dawky s'efforce de maintenir les informations disponibles sur le site aussi précises et à jour que possible. Cependant, Dawky ne peut être tenu responsable des erreurs, omissions ou résultats qui pourraient être obtenus par un mauvais usage de ces informations.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Mentions légales — Dawky' })
</script>

<style scoped>
.legal-page { background: var(--cream); }
.legal-block {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  border: 2px solid var(--border);
}
.legal-block h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
  color: var(--blue);
}
.legal-block p { color: var(--ink-soft); line-height: 1.7; margin-bottom: var(--space-3); }
.legal-block p:last-child { margin-bottom: 0; }
.legal-block ul { list-style: disc; padding-left: var(--space-5); color: var(--ink-soft); }
.legal-block ul li { margin-bottom: var(--space-2); }
.legal-block a { color: var(--blue); }
</style>
