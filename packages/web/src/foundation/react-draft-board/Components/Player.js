import React from 'react';
import '../Styles/Player.css';

const bgColor = 'lightgray';

const Player = (props) => {
    return (
        <tr style={{  }}>
        <td style={{ width:400 }}>{props.player.name}</td>
        <td className={"playerColor"+props.player.position} 
            style={{ width:50 }}>{props.player.position}</td>
        <td style={{ width:50 }}>{props.player.team}</td>
        <td style={{ width:50 }}>${props.player.salary}</td>
        </tr>
    )
}


export default Player;