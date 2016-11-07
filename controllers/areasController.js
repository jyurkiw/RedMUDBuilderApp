app.controller('AreaList', function($scope, $http) {
    $scope.areacodeList = [];
    $scope.areas = [];
    $scope.currentarea = null;

    // Area Widget flags
    $scope.newarea = false;
    $scope.editarea = false;
    $scope.deletearea = false;

    $scope.addArea = function addArea() {
        $scope.currentarea = null;

        $scope.newarea = true;
        $scope.editarea = false;
        $scope.deletearea = false;
    };

    $scope.aw_addNewArea = function aw_addNewArea() {
        var newArea = {
            areacode: $scope.aw.areacode,
            name: $scope.aw.name,
            description: $scope.aw.description
        };

        $scope.areacodeList.push(newArea.areacode);
        $scope.areas.push(newArea);
        $scope.currentarea = newArea;
    };

    $scope.aw_editArea = function aw_editArea() {

    };

    $scope.aw_deleteArea = function aw_deleteArea() {
        var deleteTarget = $scope.currentarea;

        $scope.currentarea = null;
        $scope.deletearea = false;
        $scope.areacodeList.splice($scope.areacodeList.indexOf(deleteTarget.areacode), 1);
        $scope.areas.splice($scope.areas.indexOf(deleteTarget), 1);
    };

    var addAreaToScope = function addAreaToScope(areaRes) {
        $scope.areas.push(areaRes.data);
    };

    var addAreaListToScope = function addAreaListToScope(areaListRes) {
        $scope.areacodeList = areaListRes.data;

        for (var i = 0; i < $scope.areacodeList.length; i++) {
            $http.get('http://localhost:8080/api/area/' + $scope.areacodeList[i])
                .then(addAreaToScope);
        }
    };

    $http.get('http://localhost:8080/api/areas').then(addAreaListToScope);
});