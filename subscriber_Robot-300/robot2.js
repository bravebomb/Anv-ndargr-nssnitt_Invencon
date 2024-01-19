let mqttClient;

window.addEventListener("load", (event) => {
  connectToBroker();

  if(location.pathname.includes("robot2sida2")){
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
const systemFailureButton = document.querySelector('.dot');
const OffBtn = document.getElementById("OFF");
const ONBtn = document.getElementById("ON");
var button = false;
const clientId = 300;
const messageTextAreaMaxSpeed = document.querySelector("#max_Speed_Message");
const messageTextArea = document.querySelector("#speed_Message");


messageTextArea.value = 0;


function connectToBroker() {

  // Change this to point to your MQTT broker
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
  mqttClient.subscribe("andel1", { qos: 0 });

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
    console.log(obj);
    if(obj.Type == clientId){
      console.log(obj.Off + "här är när vi precist läst objektet");
      
      if(obj.hasOwnProperty("Off")){
        if(obj.Off){
          button = false;
          console.log(" knappen är av");   
          if(location.pathname.includes("robot2sida1")){
            messageTextAreaMaxSpeed.value = 0 + "\r\n";
            }
          if(location.pathname.includes("robot2sida2")){
              OffBtn.classList.add("active");
              ONBtn.classList.remove("active");
            }
        } else {
          button = true;
          console.log(" knappen är på");
          if(location.pathname.includes("robot2sida2")){
            ONBtn.classList.add("active");
            OffBtn.classList.remove("active");
          }
        }
      }

    if(obj.Failure){
      if(location.pathname.includes("robot2sida2")){
      ONBtn.classList.remove("active");
      OffBtn.classList.add("active");
      systemFailureButton.classList.remove("disabled")
      systemFailureButton.classList.add("active");
      }
      if(location.pathname.includes("robot2sida1")){
        messageTextAreaMaxSpeed.value = 0;
      }
      button = false;
    }

    if(!obj.Failure){
      if(location.pathname.includes("robot2sida2")){
        systemFailureButton.classList.remove("active")
        systemFailureButton.classList.add("disabled");; 
      }
    }

    console.log(button + " innan speed ska skrivas in");

    if(location.pathname.includes("robot2sida1")){
      if(!isNaN(parseInt(obj.Speed)) && button){
        messageTextAreaMaxSpeed.value = obj.Speed + "\r\n";
      } 
    }
  }
  });
}



function OnButton(){
  if(systemFailureButton.classList.contains("active")){
    return
  }
  console.log("button pressed ON");
  ONBtn.classList.add("active");
  OffBtn.classList.remove("active");

  var robot = {
    Type : clientId,
    Off : false,
  }

  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
}

function OffButton(){
  console.log("button pressed OFF");
  OffBtn.classList.add("active");
  ONBtn.classList.remove("active");

  var robot = {
    Type : clientId,
    Off : true,
  }

  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
}

function whatsTheSpeed(){
  console.log("SENDING NEW SPEED" + " THE ID IS " + clientId);
  var thisSpeed = Math.floor(Math.random() * ((10-1)+1)+ 1)
  if(thisSpeed > getMaxSpeed())
  thisSpeed = getMaxSpeed();
  var status;
  if(button){
    status = "ON";
  } else {
    status = "OFF";
  }
  var robot = {
    Robot : clientId,
    Speed : thisSpeed,
    MaxSpeed : getMaxSpeed(),
    Status : status,
  }

  mqttClient.publish("andel1337", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });

  mqttClient.publish("andel420", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });

  if(location.pathname.includes("robot2sida1")){
  messageTextArea.value = thisSpeed + "\r\n";
  }

}

setInterval(function(){
  whatsTheSpeed()
},1000)

function getMaxSpeed(){
  return Number(messageTextAreaMaxSpeed.value);
}
