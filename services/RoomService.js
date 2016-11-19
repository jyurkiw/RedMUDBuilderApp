/**
 * Room Service
 * A service for dealing with rooms.
 * 
 * @namespace roomservice
 */
angular.module('RoomService', [])
    .factory('RoomAPI', ['$http', function($http) {
        /**
         * Get a room from the api.
         * 
         * @memberof roomservice
         * @param {string} areaOrRoomCode Either an areacode or a full roomcode.
         * @param {number} roomnumber A roomnumber (omitted if areaOrRoomCode is a room code).
         */
        function getRoom(areaOrRoomCode, roomnumber) {
            var areacode = null;
            if (isRoomCode(areaOrRoomCode)) {
                var splitCode = areaOrRoomCode.split(':');
                areacode = splitCode[1];
                roomnumber = splitCode[2];
            } else {
                areacode = areaOrRoomCode;
            }

            return $http.get('http://localhost:8080/api/room/' + areacode + '/' + roomnumber);
        }

        function postRoom(room) {
            return $http.post('http://localhost:8080/api/room', room);
        }

        function updateRoom(areacode, roomForm) {
            var room = {
                name: roomForm.name,
                description: roomForm.description
            };

            return $http.put('http://localhost:8080/api/room/' + areacode + '/' + roomForm.roomnumber, room);
        }

        function connectToExistingRoom(command, source, destination) {
            if (command === undefined) {
                console.log("Need defined command");
                throw "Need defined command";
            } else {
                return $http.post('http://localhost:8080/api/room/exit', { command: command, source: source, destination: destination });
            }
        }

        function disconnectFromRoom(command, areacode, roomnumber) {
            return $http.delete('http://localhost:8080/api/room/exit/' + areacode + '/' + roomnumber + '/' + command);
        }

        /**
         * Get a room name lookup table from the api for the passed areacode.
         * 
         * @param {string} areacode The areacode to lookup.
         * @returns A room name lookup table keyed to room codes.
         */
        function getAreaRoomLookup(areacode) {
            return $http.get('http://localhost:8080/api/rooms/exits/lookup/' + areacode);
        }

        /**
         * Check the passed string for room code base keying.
         *  
         * @memberof roomservice
         * @param {string} code The code to check.
         * @returns True if the code is a room code.
         */
        function isRoomCode(code) {
            if (typeof(code) === 'string' && code.substr(0, 2) === 'RM') return true;
            else return false;
        }

        /**
         * Parses a room code and returns a structure containing the areacode and roomnumber.
         * 
         * @param {string} code The code to parse. 
         * @returns An object containing the areacode and roomnumber.
         */
        function parseRoomCode(code) {
            if (isRoomCode(code)) {
                var firstColon = code.indexOf(':') + 1;
                var lastColon = code.lastIndexOf(':');

                return {
                    areacode: code.substr(firstColon, lastColon - firstColon),
                    roomnumber: parseInt(code.substr(lastColon + 1), 10)
                };
            } else {
                return false;
            }
        }

        /**
         * Build a room code.
         * 
         * @param {any} areacode An area code.
         * @param {any} roomnumber A room number.
         * @returns A room code.
         */
        function buildRoomCode(areacode, roomnumber) {
            return 'RM:' + areacode + ':' + roomnumber;
        }

        return {
            buildRoomCode: buildRoomCode,
            connectToExistingRoom: connectToExistingRoom,
            disconnectFromRoom: disconnectFromRoom,
            getRoom: getRoom,
            getAreaRoomLookup: getAreaRoomLookup,
            isRoomCode: isRoomCode,
            parseRoomCode: parseRoomCode,
            postRoom: postRoom,
            updateRoom: updateRoom
        };
    }]);