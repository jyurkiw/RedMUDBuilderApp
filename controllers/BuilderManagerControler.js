app.controller('BuilderManagerControler', function($scope, $http, RoomAPI) {
    $scope.areas = [];
    $scope.areaManager = {
        current: null,
        form: {}
    };
    $scope.roomManager = {
        current: null,
        form: {},
        nameLookup: {}
    };
    $scope.newArea = false;

    $scope.onAreaChange = function(getRoom) {
        getRoom = !(getRoom === null || !getRoom);

        newArea = false;
        updateAreaManagementForm();
        RoomAPI.getRoom($scope.areaManager.current.areacode, 1)
            .then(function(getRoomResponse) {
                $scope.roomManager.current = getRoomResponse.data;
            })
            .then(function() {
                updateRoomManagementForm();
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
            .then(
                function(res) {
                    $scope.areas.push(Object.assign({}, $scope.areaManager.form));
                    $scope.areaManager.current = Object.assign({}, $scope.areaManager.form);
                    $scope.newArea = false;
                },
                function(err) {
                    console.log(err);
                });
    };

    $scope.addNewExit = function addNewExit() {
        var newExit = {
            areacode: $scope.roomManager.form.newExitArea,
            roomcode: $scope.roomManager.form.newExitRoom,
            name: $scope.roomManager.nameLookup[$scope.roomManager.form.newExitArea][$scope.roomManager.form.newExitRoom]
        };
        $scope.roomManager.form.exits[$scope.roomManager.form.newExitCommand] = newExit;

        $scope.roomManager.form.newExitCommand = null;
        $scope.roomManager.form.newExitArea = null;
        $scope.roomManager.form.newExitRoom = null;

        // TODO: Add exit to DB and curate local data sets
        // TODO: Add new room logic
    };

    $scope.goToRoom = function goToRoom(room) {
        console.log(room);
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