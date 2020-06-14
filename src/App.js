import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import queryString from 'query-string';
// 

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return (
        <div>
          <input type="image" src={playlist.imageUrl} className="image"/>
          <h3>{this.props.playlist.name}</h3>
        </div>
    );
  }
}
class Songs extends Component {
  render() {
    return (
      <div>
          <h1 className="plName">{this.props.playlist.name}</h1> 
          <ul>
            {this.props.playlist.songs.map(song =>
              <li className="songList">
                {song.name} {song.artists.toString().replace(",", ", ")}
                <li className = "songList" 
                  style={{display: "inline", fontWeight: "lighter", marginLeft: "10px"}}>
                    {song.artists.toString().replace(",", ", ")}
                </li>
              </li>)}
          </ul>
      </div>
    );
  }
}

class PlaylistCounter extends Component {
  render() {
    let plCount = ""
    if ((this.props.playlists.length) == 1) {plCount = "playlist"}
    else {plCount = "playlists"}

    return (
      <div>
        <h2>{this.props.playlists.length} {plCount}</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div>
          <input id="filter" type="text" placeholder="Search Playlists" onKeyUp={event => 
            this.props.onTextChange(event.target.value)}/>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {serverData: {},
    filterString: ""
    }
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token
    if (!accessToken) {
      return;
    }
    else {
          fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
      user: {
        name: data.display_name
      }
    }))
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(playlistData => {
      let playlists = playlistData.items
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        })
        let trackDataPromise = responsePromise
        .then(response => response.json())
        return trackDataPromise
      })
      let allTracksDataPromises = 
      Promise.all(trackDataPromises)
      let playlistsPromise = allTracksDataPromises.then(trackDatas => {
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            artists: trackData.artists.map(artist => artist.name),
            name: trackData.name,
            duration: trackData.duration_ms / 1000
          }))
      })
      return playlists
    })
    return playlistsPromise
  })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        console.log(item.trackDatas)
        console.log(item.uri)
        return {
          name: item.name,
          imageUrl: item.images[0].url, 
          songs: item.trackDatas,
          uri: item.uri
          
        }
        
    })
    }))


    }

  }
  render() {
    let playlistToRender = this.state.user && this.state.playlists ? 
    this.state.playlists.filter(playlist => {
      let matchesPlaylist = playlist.name.toLowerCase().includes(
        this.state.filterString.toLowerCase())
      let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
      .includes(this.state.filterString.toLowerCase()))
      let matchesArtists = playlist.songs.find(song => song.artists.toString().toLowerCase()
      .includes(this.state.filterString.toLowerCase()))
        return matchesPlaylist || matchesSong || matchesArtists
      }) 
      : []
    return (
      <div className="App">
        {this.state.user ? // ? = if true, run code, if else, run whatever's after :
        <div> 
          <h1 className="title">lyricify</h1>
          <Filter onTextChange={text => this.setState({filterString: text})}/>
          <PlaylistCounter playlists={playlistToRender}/>

          {playlistToRender.map(playlists =>
          <div className="ply">
          <Playlist playlist={playlists}/>
          </div>)}
          {playlistToRender.map(playlists =>
          <div className="songsUI">
            <Songs playlist={playlists}/>
          </div>)}
          

 

        </div> : <div className="center"><button onClick={()=>window.location="http://localhost:8888/login"}
        className="but">Sign in with Spotify</button></div>
        }
      </div>
    );
  }
}



export default App;
