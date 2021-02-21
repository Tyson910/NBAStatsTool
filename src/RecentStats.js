import React, {useState, useEffect} from 'react';
import RecentStatsTable from './RecentStatsTable';


export default function RecentStats({player, start_date, end_date}){

//create startDatePretty and startDateAPI
    //returns date in 'YYYY-MM-DD' numerical format for API reference
    function createAPIDate( uglyDate ){
                                                //Jan == 1; Feb==2 in API   
        return uglyDate.getFullYear() +  '-' + ( uglyDate.getMonth() + 1 ) + '-' + uglyDate.getDate();
    }
    //returns date in 'Jan 1, 2021' format for table header
    function createPrettyDate( uglyDate ){

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ];

        return months[uglyDate.getMonth()] +  ' ' + uglyDate.getDate() + ', ' + uglyDate.getFullYear();
    }

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    //fetches player info then adds it to state
    async function fetchStats(){
        if(start_date){
        setLoading(true);
        var API = `https://www.balldontlie.io/api/v1/stats/?start_date=${createAPIDate(start_date)}&end_date=${createAPIDate(end_date)}&player_ids[]=`;

        let response = await fetch(API + player.id);
        let resultObj = await response.json();
        var dataArray = resultObj.data;
        //sorts games by date in ascending order
        setStats(dataArray.sort( (a,b) => new Date(a.game.date) - new Date(b.game.date) )); 
        setLoading(false);  
    }
}
        useEffect(() => {
            fetchStats()
        }, [start_date,end_date] );


        if(loading){
            return <div>Loading</div>

        }
        else if( stats ){
            return (
                <RecentStatsTable statsArray={stats} 
                first_name={player.first_name} last_name={player.last_name}
                start_date = {createPrettyDate(start_date)} end_date = {createPrettyDate(end_date)} />
            )
        }
        else{
            return <div>Hey</div>

        }
}