import json
import time

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import get_object_or_404

import paho.mqtt.client as mqtt
import struct

newPosX = 0
newPosY = 0
newSeqNo = 0
i = 0

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("connected OK")
    else:
        print("Bad connection Returned Code :", rc)

def on_disconnect(client, userdata, flags, rc=0):
    print('disconnected ', str(rc))

def on_subscribe(client, userdata, mid, granted_qos):
    print("subscribed")

def on_message(client, userdata, msg):
    global newPosX
    global newPosY
    global newSeqNo
    global i
    try:
        unpacked_msg = struct.unpack('7h', msg.payload)
        print('3) 제어기 -> 웹소켓 :', unpacked_msg)
        newPosX = unpacked_msg[2]
        newPosY = unpacked_msg[3]
        newSeqNo = unpacked_msg[6]
        i += 1
        print("3) 총 메시지를 받은 횟수 :", i)
    except:
        print("unpack fail")

def on_publish(client, userdata, result):
    print("data published")
    pass


client = mqtt.Client()
host = '192.168.0.172'
port = 1883

client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_publish = on_publish

client.connect(host, port)
client.subscribe("pacman/next")


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        posX = text_data_json["posX"]
        posY = text_data_json["posY"]
        direction = text_data_json["direction"]
        speed = text_data_json["speed"]
        seqNo = text_data_json["seqNo"]
        print("1) js -> 웹소켓 :", posX, posY, seqNo)

        dataToSend = struct.pack('7h', posX, posY, 100, 100, direction, speed, seqNo)
        client.publish("pacman/current", dataToSend)
        print("2) 웹소켓 -> 제어기 : ", posX, posY, seqNo)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "posX": posX, "posY": posY, 'direction' : direction, 'speed' : speed, "seqNo" : seqNo}
        )

    # Receive message from room group
    async def chat_message(self, event):

        posX = event["posX"]
        posY = event["posY"]
        direction = event["direction"]
        speed = event["speed"]
        seqNo = event["seqNo"]

        print("chat_msg :", posX, posY, seqNo)

        #client.loop(.1)
        print('확인 :', seqNo, '= ', newSeqNo, i)

        while seqNo > newSeqNo :
            client.loop(.1)
        print('확인2 :', seqNo, '= ', newSeqNo, i)
        print("확인2 :", newPosX, newPosY, newSeqNo)

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"posX": newPosX, "posY": newPosY, 'direction' : direction, 'speed' : speed, "seqNo" : newSeqNo}))