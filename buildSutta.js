// bookLength is the number of suttas + number of headings
// start is just a time of when the building process started

import buildSuttaHtml from "./buildSuttaHtml.js";

const version = 'unpublished';
const endpoint = {
  published: (book, translator, language) => {
    // Sample Production endpoint:
    // https://suttacentral.net/api/bilarasuttas/sn24.1/sujato?lang=en
    return `https://suttacentral.net/api/bilarasuttas/${book}/${translator}?lang=${language}`;
  },
  unpublished: (book, translator, language) => {
    // Sample Bilara endpoint:
    // https://bilara.suttacentral.net/api/segments/sn24.1_translation-en-davis?tertiary=translation-en-sujato%2Ccomment-en-sujato
    return `https://bilara.suttacentral.net/api/segments/${book}_translation-${language}-${translator}`;
    // actual: https://bilara.suttacentral.net/api/segments/dn1_translation-en-sujato
    // live:   https://bilara.suttacentral.net/api/segments/dn1_translation-en-sujato
  }
}[version];

export default function buildSutta(slug, article, translator, bookLength, start) {
  slug = slug.toLowerCase();

  // const counter = document.querySelector("#counter");

  if (JSON.parse(localStorage.local) === true) {
    // fetch the information to build the sutta from LOCAL
    const rootResponse = fetch(`./root/${slug}_root-pli-ms.json`).then(response => response.json());
    const translationResponse = fetch(`./translation/${slug}_translation-en-${translator}.json`).then(response =>
      response.json()
    );
    const htmlResponse = fetch(`./html/${slug}_html.json`).then(response => response.json());

    // work with all the local data once it is fetched
    Promise.all([rootResponse, translationResponse, htmlResponse]).then(responses => {
      let [paliData, transData, htmlData] = responses;
      buildSuttaHtml(paliData, transData, htmlData, article, bookLength, start);
    });
  } else {
    // fetch the information to build the sutta from API
    const language = "en";
    const book = article.replace(/vagga\d+\//, "");
    fetch(endpoint(book, translator, language))
      .then(response => response.json())
      .then(data => {
        const { html_text, translation_text, root_text } = data;

        buildSuttaHtml(root_text, translation_text, html_text, article, bookLength, start);
      });
  }
}
