let mqttClient;

window.addEventListener("load", (event) => {
  connectToBroker();

  if(location.pathname.includes("teleremote1")){
    console.log("sida 2");
  const onBTN = document.querySelector('#ON');
  onBTN.addEventListener("click", function () {
    OnButton();
  });

  const offBTN = document.querySelector('#OFF');
  offBTN.addEventListener("click", function () {
    OffButton();
  });
}
});

const systemfailurebutton = document.querySelector(".dot");
const OffBtn = document.getElementById("OFF");
const ONBtn = document.getElementById("ON");

var robots = [
];

var robotVald = "None";

function connectToBroker() {
  const clientId = "client" + Math.random().toString(36).substring(7);

  // Change this to point to your MQTT broker
  //const host = "ws://broker.emqx.io:8083/mqtt";
  const host = "ws://broker.emqx.io:8083/mqtt";

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 5,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  mqttClient = mqtt.connect(host, options);
  mqttClient.subscribe("andel420", { qos: 0 });

  mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("reconnect", () => {
    console.log("Reconnecting...");
  });

  mqttClient.on("connect", () => {
    console.log("Client connected:" + clientId);
  });

  // Received
  mqttClient.on("message", (topic, message, packet) => {
    const obj = JSON.parse(message.toString());
    ///visar information om meddelandet som togs emot
    console.log(obj);
    if(obj.hasOwnProperty("robotValue")){
      console.log("ÄNDRAR VÄRDE");
      robotVald = obj.robotValue;
    } else if(obj.hasOwnProperty("Failure")) {
      if(location.pathname.includes("teleremote1")){
        if(obj.Failure){
          systemfailurebutton.style.background = "red";
        }
        if(!obj.Failure){
          systemfailurebutton.style.background = "grey";
        }
      }
    } else {
      if(isNaN(obj.Topic)){
        var noRobotExists = true;
        robots.forEach(function(machine) {
          if(Number(machine.Topic) == Number(obj.Robot)){
            if(machine.MaxSpeed != obj.MaxSpeed){
              machine.MaxSpeed = obj.MaxSpeed;
              updatelist();
            }
            if(machine.Speed != obj.Speed){
              machine.Speed = obj.Speed;
              updatelist();
            }
            if(obj.Status == "OFF"){
              machine.Status = "OFF";
              updatelist();
            }
            if(obj.Status == "ON"){
              machine.Status = "ON";
              updatelist();
            }
            noRobotExists = false;
          }
        })
    
    
        if(noRobotExists){
         console.log("NEW ROBOT ADDED") 
         var newRobot = {Topic : obj.Robot, Type: 'R-1000', Status: 'OFF', Speed: obj.Speed, MaxSpeed : obj.MaxSpeed};
         robots.push(newRobot);
         updatelist();
        }
      }
    }
  });
}


function updatelist(){
  if(location.pathname.includes("teleremote1")){
  var wrapper = document.querySelector('.dropdown');
    ///denna delatar listan
  while(wrapper.firstChild){
    wrapper.removeChild(wrapper.firstChild);
  }
  robots.forEach(function(robot,index){
    var robotLi = document.createElement('option');
    robotLi.class = robot.Topic
  
    var robotHtml = `
      <option value=${robot.Topic}>${robot.Topic}</option>
    `;
  
    robotLi.innerHTML = robotHtml;
    if(robot.Topic == robotVald){
      wrapper.insertBefore(robotLi, wrapper.firstChild);
    } else{
      wrapper.appendChild(robotLi);
    }
  })
  var selectedRobots = document.getElementById("selectedRobots");
  selectedRobots.value = robotVald;
  }
}

function OnButton(){
  console.log("button pressed ON");
  //ONBtn.classList.add("active");
  //OffBtn.classList.remove("active");

  var robot = {
    Type : robotVald,
    Off : false,
  }

  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
}

function OffButton(){
  console.log("button pressed OFF");
  //OffBtn.classList.add("active");
  //ONBtn.classList.remove("active");

  var robot = {
    Type : robotVald,
    Off : true,
  }

  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
  
}

///Uppdaterar i listan vilken som är vald
function handleChange(robot){
  var robot = {
    robotValue : robot.target.value,
  }

  mqttClient.publish("andel420", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
}

function showSpeeds(){
  //console.log(robotVald);
  robots.forEach(function(machine){
    //console.log(robotVald + " = " + machine.Topic)
    if(robotVald == Number(machine.Topic)){
      if(location.pathname.includes("teleremote2")){
        const messageTextAreaMaxSpeed = document.querySelector("#max_Speed_Message");
        const messageTextArea = document.querySelector("#speed_Message");
        messageTextArea.value = machine.Speed;
        messageTextAreaMaxSpeed.value = machine.MaxSpeed;
      }
      if(location.pathname.includes("teleremote1")){
        if(machine.Status == "ON"){
          ONBtn.classList.add("active");
          OffBtn.classList.remove("active");
        }
        if(machine.Status == "OFF"){
          OffBtn.classList.add("active");
          ONBtn.classList.remove("active");
        }
      }
    }
  })
}

setInterval(function(){
  showSpeeds()
},1000)


function systemFailure(){
  const systemFailureButton = document.querySelector('.dot');
  if(systemFailureButton.style.background=="red"){
    console.log("clear");
    systemFailureButton.style.background="grey";

    robots.forEach(function(machine){

      var robot = {
        Type : machine.Topic,
        Failure : false,
      }
  
      mqttClient.publish("andel1", JSON.stringify(robot), {
        qos: 0,
        retain: false,
      });

    })

    var robot = {
      Failure : false,
    }

    mqttClient.publish("andel1337", JSON.stringify(robot), {
      qos: 0,
      retain: false,
    });

  } else {
    systemFailureButton.style.background="red";

    robots.forEach(function(machine){

      var robot = {
        Type : machine.Topic,
        Failure : true,
      }
  
      mqttClient.publish("andel1", JSON.stringify(robot), {
        qos: 0,
        retain: false,
      });
      
      mqttClient.publish("andel1337", JSON.stringify(robot), {
        qos: 0,
        retain: false,
      });

    })
    var robot = {
      Failure : false,
    }

    mqttClient.publish("andel1337", JSON.stringify(robot), {
      qos: 0,
      retain: false,
    });
  }
}