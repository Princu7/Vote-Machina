var counter=2;
function createOption(){
    counter+=1;
    var container=document.getElementById("optionsContainer");
    var input=document.createElement("input");
    input.type='text';
    input.name='option'+counter.toString();
    input.placeholder='New Option';
    input.required="";
    input.className="form-control";
    container.appendChild(input);
}

