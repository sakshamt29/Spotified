let ac = document.querySelector(".access");
let btn = document.querySelector(".btn");
let search = document.querySelector(".spotify");
let youtube = document.querySelector(".youtube");
let playlist_id = "";
let youtube_url = "";
let song_id = [];
let song_name = "";
let artist = "";
let y_apikey = "";
let y_clientid = "";
let y_playlist = "";
let user_id = "";
// Login to Spotify and get Access Token------------->
ac.addEventListener("click", function () {
  const authEndpoint = "https://accounts.spotify.com/authorize";
  const clientId = "1c507c87a7774809b6eb4dc7869097c8";
  const redirectUri = "https://sakshamt29.github.io/Spotified/";
  const scopes = ["playlist-modify-private"];

  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token&show_dialog=true`;
});

let n = window.location.href.indexOf("=");
let and = window.location.href.indexOf("&");

let access_token = window.location.href.substring(n + 1, and);
// ------------end-------------------------
//--------------Get Spotify User Id--------------------------->
function get_spotify_userid() {
  const ajax6 = new XMLHttpRequest();

  let url3 = `https://api.spotify.com/v1/me`;
  ajax6.open("GET", url3, true);
  ajax6.setRequestHeader("Authorization", `Bearer ${access_token}`);

  ajax6.onload = function () {
    if (this.status === 200 || this.status === 201) {
      //console.log(this.responseText);

      const data = JSON.parse(this.responseText);
      user_id = data.id;
    } else {
      console.log(this.statusText);
    }
  };
  ajax6.send();
}
// -----------------end-----------------
get_spotify_userid();
//----------------Create Spotify Playlist------------------->
btn.addEventListener("click", function () {
  const ajax = new XMLHttpRequest();
  let see = {
    name: "Youtube Playlist",
    description: "Playlist Created using Spotified",
    public: false,
  };

  let url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
  ajax.open("POST", url, true);
  ajax.setRequestHeader("Authorization", `Bearer ${access_token}`);

  ajax.onload = function () {
    if (this.status === 200 || this.status === 201) {
      //console.log(this.responseText);

      const data = JSON.parse(this.responseText);

      playlist_id = data.id;
    } else {
      console.log(this.statusText);
    }
  };
  ajax.send(JSON.stringify(see));
  alert("Playlist Created!");
});
// --------------end---------------------------
//function to add song to spotify playlist ----------------->
function add_song_to_playlist(songs_uri) {
  const ajax4 = new XMLHttpRequest();
  let url4 = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
  ajax4.open("POST", url4, true);
  ajax4.setRequestHeader("Authorization", `Bearer ${access_token}`);
  ajax4.setRequestHeader("Content-Type", `application/json`);
  ajax4.onload = function () {
    if (this.status === 200 || this.status === 201) {
      console.log("Song added");
    } else {
      console.log(this.statusText);
    }
  };
  let d = {
    uris: [songs_uri],
  };

  ajax4.send(JSON.stringify(d));
}
// ---------------end-----------------------

// function to get song uri from spotify---------------->
function search_spotify(song_name, artist) {
  const ajax2 = new XMLHttpRequest();

  let url2 = `https://api.spotify.com/v1/search?query=track%3A${song_name}+${artist}%3A&type=track&offset=0&limit=20`;
  console.log(url2);

  ajax2.open("GET", url2, true);
  ajax2.setRequestHeader("Authorization", `Bearer ${access_token}`);

  ajax2.onload = function () {
    if (this.status === 200 || this.status === 201) {
      //console.log(this.responseText);

      const data = JSON.parse(this.responseText);
      // console.log(data);
      let songs_uri = data.tracks.items[0].uri;
      add_song_to_playlist(songs_uri);
    } else {
      console.log(this.statusText);
    }
  };
  ajax2.send();
}
// -------------------end-----------------
// Get song names from the youtube playlist---------------->
search.addEventListener("click", function () {
  for (let i = 0; i < song_id.length; i++) {
    youtube_url = `https://youtube-dl-sak1.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=${song_id[i]}`;
    const ajax3 = new XMLHttpRequest();
    ajax3.open("GET", youtube_url, true);
    ajax3.onload = function () {
      if (this.status === 200 || this.status === 201) {
        const data = JSON.parse(this.responseText);
        song_name = data.info.alt_title;
        console.log(song_name);
        console.log(data.info.artist);
        if (song_name !== null && data.info.artist !== null) {
          search_spotify(song_name, data.info.artist);
        }
      } else {
        console.log(this.statusText);
      }
    };
    ajax3.send();
  }
  alert("Songs added to playlist");
});
// ------------------end----------------

//---------Take input for youtube apikey,clientid and playlist id-------------->
function getInputValue() {
  // Selecting the input element and get its value
  y_apikey = document.getElementById("y_apikey").value;
  y_clientid = document.getElementById("y_clientid").value;
  y_playlist = document.getElementById("y_playlist").value;
  alert("Data Submitted");
}
// -----------------end---------------
//-------------------------Youtube api load client-------->
function loadClient() {
  gapi.client.setApiKey(y_apikey);
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      function () {
        console.log("GAPI client loaded for API");
        execute();
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}
// Function to get song id's from youtube playlist---------->
function execute() {
  return gapi.client.youtube.playlistItems
    .list({
      part: ["snippet"],
      playlistId: y_playlist,
      prettyPrint: true,
      alt: "json",
      maxResults: 50,
    })
    .then(
      function (response) {
        console.log(response.result);

        for (let k = 0; k < response.result.pageInfo.totalResults; k++) {
          song_id.push(response.result.items[k].snippet.resourceId.videoId);
        }
      },
      function (err) {
        console.error("Execute error", err);
      }
    );
}
gapi.load("client:auth2", function () {
  gapi.auth2.init({
    client_id: y_clientid,
  });
});
// ------------------end------------

//<--------------Made by Saksham Tomar------------>
