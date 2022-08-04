"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing"

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
 
  let shows = response.data.map(result => {
    let show = result.show;
    // console.log(result);
      return {
          id: show.id,
          name: show.name,
          summary: show.summary,
          image: show.image ? show.image.medium : MISSING_IMAGE_URL,
      };
  });
return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number

  }));
  console.log(episodes);
  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
  const episodesList = $("#episodes-list");
  //clear episode list each time this function is triggered
  episodesList.empty();

  for(let episode of episodes) {
    let li = document.createElement("LI");
    li.textContent = `${episode.name} (season ${episode.season}, episode ${episode.number})`
    episodesList.append(li);
  }
  $("#episodes-area").show();
}

$("#shows-list").on("click", ".show-getEpisodes", async function handleEpisodeClick(e) {
  //finds the closest id to associate with button/show    
  let showId = $(e.target).closest(".Show").data("show-id");
  //get episodes with the show id found above
  let episodes = await getEpisodesOfShow(showId);
  //run function to populate episodes to list
      populateEpisodes(episodes);
});
