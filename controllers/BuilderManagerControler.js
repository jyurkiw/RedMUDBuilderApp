app.controller('BuilderManagerControler', function($scope, $http, RoomAPI) {
    $scope.areas = [];
    $scope.areaLookup = {};
    $scope.areaManager = {
        current: null,
        form: {}
    };
    $scope.roomManager = {
        current: {},
        form: {
            newExitArea: null,
            newExitRoom: null
        },
        nameLookup: {}
    };
    $scope.newArea = false;
    $scope.newRoom = false;

    $scope.test = function test() {
        console.log($scope.roomManager.nameLookup);
    };

    $scope.onAreaChange = function(getRoom) {
        return new Promise(function(resolve, reject) {
            getRoom = !(getRoom === null || !getRoom);

            newArea = false;
            updateAreaManagementForm();
            resolve();
        });
    };

    $scope.onRoomChange = function(roomnumber) {
        return new Promise(function(resolve, reject) {
            if (typeof(roomnumber) === 'undefined' || roomnumber === null) {
                roomnumber = 1;
            } else if (RoomAPI.isRoomCode(roomnumber)) {
                roomnumber = RoomAPI.parseRoomCode(roomnumber).roomnumber;
            }

            RoomAPI.getRoom($scope.areaManager.current.areacode, roomnumber)
                .then(function(getRoomResponse) {
                    $scope.roomManager.current = getRoomResponse.data;
                })
                .then(function() {
                    updateRoomManagementForm();
                })
                .then(function() {
                    resolve();
                });
        });
    };

    $scope.onNewRoom = function() {
        return new Promise(function(resolve, reject) {
            $scope.roomManager.current = {};
            $scope.roomManager.form = {
                newExitArea: null,
                newExitRoom: null
            }
        });
    };

    function updateAreaManagementForm() {
        $scope.areaManager.form.areacode = $scope.areaManager.current.areacode;
        $scope.areaManager.form.name = $scope.areaManager.current.name;
        $scope.areaManager.form.description = $scope.areaManager.current.description;
    }

    function updateRoomManagementForm() {
        $scope.roomManager.form.roomnumber = $scope.roomManager.current.roomnumber;
        $scope.roomManager.form.name = $scope.roomManager.current.name;
        $scope.roomManager.form.description = $scope.roomManager.current.description;

        $scope.roomManager.form.newExitArea = $scope.areaLookup[$scope.roomManager.current.areacode].areacode;

        var exitDict = {};
        for (var command in $scope.roomManager.current.exits) {
            var roomcode = $scope.roomManager.current.exits[command];
            var parsedExitData = RoomAPI.parseRoomCode(roomcode);

            exitDict[command] = {
                areacode: parsedExitData.areacode,
                roomcode: roomcode,
                name: $scope.roomManager.nameLookup[parsedExitData.areacode][roomcode]
            };
        }
        $scope.roomManager.form.exits = exitDict;
    }

    $scope.resetActiveArea = function resetActiveArea() {
        $scope.areaManager.form.name = $scope.areaManager.current.name;
        $scope.areaManager.form.description = $scope.areaManager.current.description;
    };

    $scope.setFormForNewArea = function setFormForNewArea() {
        $scope.areaManager = {
            current: null,
            form: {}
        };
        $scope.newArea = true;
    };

    $scope.setFormForNewRoom = function setFormForNewRoom() {
        $scope.roomManager = {
            current: null,
            form: {
                roomnumber: 1
            },
            nameLookup: $scope.roomManager.nameLookup
        };
    };

    $scope.addNewArea = function addNewArea() {
        $scope.areaManager.form.areacode = $scope.areaManager.form.areacode.toUpperCase();

        $http.post('http://localhost:8080/api/area', $scope.areaManager.form)
            .then(function(res) {
                    $scope.areas.push(Object.assign({}, $scope.areaManager.form));
                    $scope.areaManager.current = Object.assign({}, $scope.areaManager.form);
                    $scope.areaLookup[$scope.areaManager.current.areacode] = $scope.areaManager.current;
                    $scope.newArea = false;
                },
                function(err) {
                    console.log(err);
                })
            .then(function() {
                var room = {
                    areacode: $scope.areaManager.current.areacode,
                    name: 'default',
                    description: 'default'
                };
                RoomAPI.postRoom(room)
                    .then(function() {
                        var areacode = $scope.areaManager.current.areacode;
                        var roomcode = RoomAPI.buildRoomCode(areacode, 1);
                        $scope.roomManager.nameLookup[areacode] = {};
                        $scope.roomManager.nameLookup[areacode][roomcode] = '1: default';
                    })
                    .then(function() {
                        $scope.roomManager.current = room;
                        updateRoomManagementForm();
                    });
            });
    };

    $scope.addNewExit = function addNewExit() {
        // Add new exit to display structures
        var newExit = {
            areacode: $scope.roomManager.form.newExitArea,
            roomcode: $scope.roomManager.form.newExitRoom,
            name: $scope.roomManager.nameLookup[$scope.roomManager.form.newExitArea][$scope.roomManager.form.newExitRoom]
        };

        // Check for new room request
        if ($scope.roomManager.form.newExitRoom === null) {
            // set the new room flag
            $scope.newRoom = true;

            var oldRoomcode = RoomAPI.buildRoomCode($scope.areaManager.form.areacode, $scope.roomManager.form.roomnumber);
            var oldCommand = $scope.roomManager.form.newExitCommand;
            var newArea = $scope.roomManager.form.newExitArea;

            // store old data
            $scope.roomManager.newRoomConnectionMemory = {
                oldRoomcode: oldRoomcode,
                oldCommand: oldCommand
            };

            if (newArea != $scope.areaManager.current.areacode) {
                $scope.areaManager.current = $scope.areaLookup[newArea];
                $scope.onAreaChange();
            }

            $scope.onNewRoom();
        } else {
            // Link two existing rooms
            var command = $scope.roomManager.form.newExitCommand;
            var roomcode1 = RoomAPI.buildRoomCode($scope.areaManager.form.areacode, $scope.roomManager.form.roomnumber);
            var roomcode2 = newExit.roomcode;

            $scope.roomManager.form.exits[$scope.roomManager.form.newExitCommand] = newExit;
            RoomAPI.connectToExistingRoom(command, roomcode1, roomcode2);
        }

        // Clean up the form
        $scope.roomManager.form.newExitCommand = null;
        $scope.roomManager.form.newExitArea = null;
        $scope.roomManager.form.newExitRoom = null;
    };

    $scope.saveNewRoom = function saveNewRoom() {
        var areacode = $scope.areaManager.current.areacode;
        var name = $scope.roomManager.form.name;
        var description = $scope.roomManager.form.description;

        var room = {
            areacode: areacode,
            name: name,
            description: description
        };

        RoomAPI.postRoom(room).then(function(response) {
            var newRoom = response.data;
            var roomConnectionMemory = $scope.roomManager.newRoomConnectionMemory;
            var newRoomcode = RoomAPI.buildRoomCode($scope.areaManager.current.areacode, newRoom.roomnumber);
            $scope.roomManager.current = newRoom;
            updateRoomManagementForm();

            // connect old room
            RoomAPI.connectToExistingRoom(roomConnectionMemory.oldCommand, roomConnectionMemory.oldRoomcode, newRoomcode);

            // add new room to nameLookup
            $scope.roomManager.nameLookup[$scope.areaManager.current.areacode][newRoomcode] = newRoom.roomnumber + ': ' + newRoom.name;

            $scope.newRoom = false;
        });
    };

    $scope.updateRoom = function updateRoom() {
        RoomAPI.updateRoom($scope.areaManager.current.areacode, $scope.roomManager.form)
            .then(function() {
                if ($scope.roomManager.current.name != $scope.roomManager.form.name) {
                    var roomcode = RoomAPI.buildRoomCode($scope.areaManager.current.areacode, $scope.roomManager.current.roomnumber);
                    $scope.roomManager.nameLookup[$scope.areaManager.current.areacode][roomcode] = $scope.roomManager.current.roomnumber + ': ' + $scope.roomManager.form.name;
                }

                $scope.roomManager.current.name = $scope.roomManager.form.name;
                $scope.roomManager.current.description = $scope.roomManager.form.description;
            });
    };

    $scope.removeExit = function removeExit(command, removedRoomcode) {
        var areacode = $scope.areaManager.current.areacode;
        var roomnumber = $scope.roomManager.current.roomnumber;

        RoomAPI.disconnectFromRoom(command, areacode, roomnumber);

        // Remove the exit from the roomManager in current and form
        delete $scope.roomManager.current.exits[command];
        delete $scope.roomManager.form.exits[command];

        // Automatically move the user to the removed room in case they need to disconnect from the other direction.
        $scope.goToRoom(removedRoomcode);
    };

    $scope.goToRoom = function goToRoom(roomcode) {
        var pRoomcode = RoomAPI.parseRoomCode(roomcode);

        if (pRoomcode.areacode != $scope.areaManager.current.areacode) {
            $scope.areaManager.current = $scope.areaLookup[pRoomcode.areacode];
            $scope.onAreaChange()
                .then(function() {
                    $scope.onRoomChange(pRoomcode.roomnumber);
                });
        } else {
            $scope.onRoomChange(pRoomcode.roomnumber);
        }
    };

    $scope.saveAreaChange = function saveAreaChange() {
        var areaIdx = $scope.areas.findIndex(function(area) {
            return area.areacode == $scope.areaManager.form.areacode;
        });

        $http.put('http://localhost:8080/api/area', $scope.areaManager.form)
            .then(
                function(res) {
                    $scope.areas[areaIdx].name = $scope.areaManager.form.name;
                    $scope.areas[areaIdx].description = $scope.areaManager.form.description;
                },
                function(err) {
                    console.log(err);
                }
            );
    };

    $scope.deleteArea = function deleteArea() {
        $http.delete('http://localhost:8080/api/area/' + $scope.areaManager.current.areacode)
            .then(
                function(res) {
                    var areaIdx = $scope.areas.findIndex(function(area) {
                        return area.areacode == $scope.areaManager.form.areacode;
                    });

                    $scope.areas.splice(areaIdx, 1);

                    $scope.areaManager = {
                        current: null,
                        form: {}
                    };
                },
                function(err) {
                    console.log(err);
                }
            );
    };

    // Initial setup functions
    var addAreaToScope = function addAreaToScope(areaRes) {
        $scope.areas.push(areaRes.data);
        $scope.areaLookup[areaRes.data.areacode] = areaRes.data;
    };

    var addAreaListToScope = function addAreaListToScope(areaListRes) {
        var areacodes = areaListRes.data;

        for (var i = 0; i < areacodes.length; i++) {
            $http.get('http://localhost:8080/api/area/' + areacodes[i])
                .then(addAreaToScope);
        }
    };

    var addRoomLookupTableToScope = function addRoomLookupTableToScope(res) {
        $scope.roomManager.nameLookup = res.data;
    };

    // Initialize the controller.
    $http.get('http://localhost:8080/api/areas').then(addAreaListToScope);
    $http.get('http://localhost:8080/api/rooms/exits/lookup').then(addRoomLookupTableToScope);
});