import React, {useState, useEffect, useRef} from 'react';
import RecentStatsTable from './RecentStatsTable';
import StatsChart from './StatsChart';

export default function RecentStats({playerArray, start_date, end_date}){


    const [statsArray, setStatsArray] = useState([ ]);
    const [loading, setLoading] = useState(false);
    const [playerRadio, setplayerRadio] = useState('');
    //holds stats of a player based on radio button selected
    const [radioBtnStats, setRadioBtnStats] = useState('');

    //saves prevPlayerArray to know when to fetch/remove stats
    const prevPlayerArray = usePrevious(playerArray);
    function usePrevious(value) {
        const ref = useRef([]);
        useEffect(() => {
        ref.current = value;
        });
        return ref.current;
    }

    //fetches player info then adds it to state
    async function fetchStats(playerID){
        setLoading(true);
        let API = `https://www.balldontlie.io/api/v1/stats/?start_date=${createAPIDate(start_date)}&end_date=${createAPIDate(end_date)}&player_ids[]=`;
        let response = await fetch(API + playerID);
        let resultObj = await response.json();
        let dataArray = resultObj.data;
        if (dataArray.length > 0){
        //sorts games by date in ascending order
        let sortedStats = dataArray.sort( (a,b) => new Date(a.game.date) - new Date(b.game.date) )
        setStatsArray( oldStatsArray => [...oldStatsArray, sortedStats ]  ); 
        }
        setLoading(false);  
    }

  //create startDatePretty and startDateAPI
    //returns date in 'YYYY-MM-DD' numerical format for API reference
    //API saves Jan == 1, Feb ==2 so we add 1 to the get Month function
    function createAPIDate( uglyDate ){ 
        return uglyDate.getFullYear() +  '-' + ( uglyDate.getMonth() + 1 ) + '-' + uglyDate.getDate();
    }

    //returns date in 'Jan 1, 2021' format for table header
    function createPrettyDate( uglyDate ){
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        return months[uglyDate.getMonth()] +  ' ' + uglyDate.getDate() + ', ' + uglyDate.getFullYear();
    }
    useEffect(() => {
            const filteredStats = statsArray.filter( games => games[0].player.id === playerRadio.id);
            if (filteredStats.length > 0){
                setRadioBtnStats(filteredStats );
            }
            else{
                setRadioBtnStats(["not found"]);
            }
    }, [playerRadio])

    useEffect(() => {

        if(!statsArray.length){
            playerArray.map( player => fetchStats(player.id))
        }

        else if( playerArray.length > prevPlayerArray.length ){
            const [newestPlayer] = playerArray.slice(-1);
            fetchStats(newestPlayer.id);
        }

        else if(playerArray.length < prevPlayerArray.length){
            function filterStats(gamesArray){
                if (playerArray.some( player => player.id === gamesArray[0].player.id) ){
                    return gamesArray;
                }
            }
            setStatsArray( statsArray.filter( games => filterStats(games) ) ) ;
        }

        else{
            setStatsArray( [] )
            playerArray.map( player => fetchStats(player.id))
        }
    
    }, [playerArray, start_date, end_date] );

    //selects first radio button on first load
    useEffect(() => {
        //console.log(playerArray[0])

        //checks if games were found between start and end date
        if(statsArray.length===1 && statsArray[0].length > 0){
            setplayerRadio(statsArray[0][0].player)
        }
        
        else if(statsArray.length===0){
            setplayerRadio(playerArray[0])
        }
        

    }, [statsArray])
 
    if(loading){
        return <div style={{margin: "0 0 20vh 0"}}>Loading</div>
    }
    else if( statsArray.length){
        return (
            <>
            <form id="player-radio">
            <fieldset >
            <legend>Select a Player: </legend>
            {playerArray.map( (player,i)=>{ 
                if(i === 0){
                    return(
                        <label key={player.id + i}>
                        <input type='radio'  value={player}  name="player radio" defaultChecked 
                        id={player.id + 'radio'} onChange={()=>setplayerRadio(player)}/>
                        {player.first_name} {player.last_name} 
                        </label>
                    )}
                else{
                    return(
                        <label key={player.id + i} >
                        <input type='radio'  value={player}  name="player radio" id={player.id + 'radio'}
                        onChange={()=>setplayerRadio(player)}/>
                        {player.first_name} {player.last_name} 
                        </label>
                    )}
                })}
            </fieldset>
            </form>

            {radioBtnStats.map( (stats) => {
                if(stats === "not found"){
                    return (
                        <div id="recent-stats">Sorry, No stats found for this 
                            player from {createPrettyDate(start_date)} to {createPrettyDate(end_date)}</div>
                    ) 
                }
                else{
                    return (
                        <RecentStatsTable statsArray={stats} key={stats[0].player.id}
                        first_name={stats[0].player.first_name} last_name={stats[0].player.last_name}
                        start_date = {createPrettyDate(start_date)} end_date = {createPrettyDate(end_date)} />
                    ) 
                }
            })}

            <div id="chart" className="flex-column">
            <StatsChart allStatsArray={statsArray} />
            </div>
            </>
        )
    }
    else if( playerRadio ){
        return (
            <>
            <form id="player-radio">
            <fieldset >
            <legend>Select a Player: </legend>
            {playerArray.map( (player,i)=>{ 
                if(i === 0){
                    return(
                        <label key={player.id + i}>
                        <input type='radio'  value={player}  name="player radio" defaultChecked 
                        id={player.id + 'radio'} onChange={()=>setplayerRadio(player)}/>
                        {player.first_name} {player.last_name} 
                        </label>
                    )}
                else{
                    return(
                        <label key={player.id + i} >
                        <input type='radio'  value={player}  name="player radio" id={player.id + 'radio'}
                        onChange={()=>setplayerRadio(player)}/>
                        {player.first_name} {player.last_name} 
                        </label>
                    )}
                })}
            </fieldset>
            </form>
            <div id="recent-stats" style={{marginBottom:'5vh'}}>Sorry, No stats found for this 
            player from {createPrettyDate(start_date)} to {createPrettyDate(end_date)}</div>


            </>
        )
    }
    else{
        return ""
    }
}