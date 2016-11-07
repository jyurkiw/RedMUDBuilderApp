app.controller('AreaManagerControler', function($scope, $http) {
    $scope.areas = [];
    $scope.areaManager = {
        current: null,
        form: {}
    };
    $scope.newArea = false;

    function review() {
        console.log($scope.areaManager);
        console.log($scope.areas.find(function(e) { return e.areacode == $scope.areaManager.form.areacode; }));
    }

    $scope.updateAreaManagementForm = function updateAreaManagementForm() {
        $scope.areaManager.form.areacode = $scope.areaManager.current.areacode;
        $scope.areaManager.form.name = $scope.areaManager.current.name;
        $scope.areaManager.form.description = $scope.areaManager.current.description;
    };

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

    // Initialize the controller.
    $http.get('http://localhost:8080/api/areas').then(addAreaListToScope);
});