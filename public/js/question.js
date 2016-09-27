window.onload=function(){
    console.log("inside onloaded document function");
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(loadPageData);
    var sel=document.getElementById("sell");
    console.log(sel);
    sel.addEventListener('change',function(){
        var optionSel = sel.options[sel.selectedIndex].text;
        var question=document.getElementById("ques").innerHTML;
        var xhr = new XMLHttpRequest();
        var url="/answer/"+question+"/"+optionSel;
        console.log("request for update sent");
        xhr.open("GET",url,true);
        xhr.send(null);
        xhr.onload=function(e){
            console.log("state of request"+xhr.readyState);
            if(xhr.readyState===4){
                console.log("ready state is 4");
                if(xhr.status===200){
                    console.log("status is 200");
                    console.log("updation done successfully");
                    loadPageData();
                }
            }
        };
    },false);
}
function loadPageData()
{
    console.log("inside Page Data");
    var question=document.getElementById("ques").innerHTML;
    var xhr = new XMLHttpRequest();
    var url="/query/"+question;
    console.log(question);
    xhr.open("GET",url,true);
    xhr.send(null);
    xhr.onload=function(e){
        console.log("state of request"+xhr.readyState);
        if(xhr.readyState===4){
            console.log("ready state is 4");
            if(xhr.status===200){
                console.log("status is 200");
                console.log(xhr.responseText);
                var newObj=JSON.parse(xhr.responseText);
                makeChart(newObj['arr'],question);
            }
        }
        else
            console.log(xhr.statusText);
    }
}

function makeChart(arr,ques){
    console.log("inside makeChart function");
    console.log(arr);
    console.log(ques);
    console.log("charts has been initialized");
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'options');
    data.addColumn('number', 'votes');
    data.addRows(arr);
    var options = {
        'legend':'right',
        'is3D':true,
        'title':ques,
        'width':400,
        'height':300};
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
