import React, {useCallback} from "react";

import "./playlist.css";

import TrackList from "../TrackList/TrackList";

const Playlist = (props) => {
    const handleNameChange = useCallback(
        (event) => {
            props.onNameChange(event.target.value);
        },
        [props.onNameChange]
    );
    return(
        <div className="Playlist">
            <input onChange={handleNameChange} defaultValue={"New Playlist"} />
            <TrackList
                tracks={props.playlistTracks}
                isRemoval={true}
                onRemove={props.onRemove}
            />
            <button className="Playlist-save" onClick={props.onSave}>
                Save this to your Spotify
            </button>
        </div>
    );
};
export default Playlist