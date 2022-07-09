var app = angular.module("myApp", ["ionic"]);
var today = new Date();
var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000);

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state("contestarEncuesta", {
            url: "/contestarEncuesta",
            templateUrl: "contestarEncuesta.html",
            controller: "contestarEncuestaCtrl",
        })
        .state("preguntasCombo", {
            url: "/preguntasCombo",
            templateUrl: "preguntasCombo.html",
            controller: "preguntasComboCtrl",
        })
        .state("altaEmpleado", {
            url: "/altaEmpleado",
            templateUrl: "altaEmpleado.html",
            controller: "altaEmpleadoCtrl"
        })
        .state("crearEncuesta", {
            url: "/crearEncuesta",
            templateUrl: "crearEncuesta.html",
            controller: "crearEncuestaCtrl"
        })
        .state("agregarPreguntas", {
            url: "/agregarPreguntas",
            templateUrl: "agregarPreguntas.html",
            controller: "agregarPreguntasCtrl"
        })
        .state("agregarRespuestas", {
            url: "/agregarRespuestas",
            templateUrl: "agregarRespuestas.html",
            controller: "agregarRespuestasCtrl"
        })
        .state("generarReportes", {
            url: "/generarReportes",
            templateUrl: "generarReportes.html",
            controller: "generarReportesCtrl"
        })
        .state("login", {
            url: "/login",
            templateUrl: "login.html",
            controller: "loginCtrl",
        });

    $urlRouterProvider.otherwise("/login");
});

app.controller("altaEmpleadoCtrl", function ($scope, $ionicSideMenuDelegate, $http, $ionicLoading, $ionicPopup) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }

    $scope.serviceUrl = serviceUrl;
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.nuevoEmpleado = {};
    $scope.contrasena = [];
    $scope.jsonNuevoEmpleado = "";

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerEmpleadoRoles"
    }).then(function (resultado) {
        $scope.roles = resultado.data;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en roles",
                template: "<center>Error al obtener roles de empleado</center>"
            });
    });
    function validarEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function limpiarVariables() {
        $scope.contrasena = [];
        $scope.nuevoEmpleado = {};
        $scope.jsonNuevoEmpleado = "";
    }
    $scope.crearEmpleado = function () {
        $ionicLoading.show();

        if (!validarEmail($scope.nuevoEmpleado.email)) {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en empleados",
                    template: "<center>Por favor, verifique que el email sea correcto</center>"
                });
            return;
        }

        if ($scope.nuevoEmpleado.nombres == null || $scope.nuevoEmpleado.apellidoPaterno == null) {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en empleados",
                    template: "<center>Por favor, llene todos los campos obligatorios</center>"
                });
            return;
        }

        if ($scope.contrasena.verificaContrasena != $scope.nuevoEmpleado.contrasena) {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en empleados",
                    template: "<center>Por favor, verifique que las contrasenas coincidan</center>"
                });
            return;
        }
        $http({
            method: "POST",
            url: $scope.serviceUrl + "/rest/Catalogos/CrearEmpleado",
            data: JSON.stringify($scope.nuevoEmpleado)
        }).then(function (resultado) {
            $ionicLoading.hide();
            if (resultado.data) {
                $ionicPopup
                    .alert({
                        title: "Transaccion de empleados",
                        template: "<center>El empleado ha sido dado de alta correctamente</center>"
                    });
                limpiarVariables();
            }
            else {
                $ionicPopup
                    .alert({
                        title: "Error en empleados",
                        template: "<center>Error al dar de alta el empleado</center>"
                    });
            }
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en empleados",
                    template: "<center>El email que intenta dar de alta ya existe</center>"
                });
        });
    }
});

app.controller("indexCtrl", function ($scope, $http, $ionicLoading, $ionicPopup) {

    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }

    function sesionDisponible() {
        if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
            $ionicPopup
                .alert({
                    title: "Error de inicio de sesion",
                    template: "<center>La sesion caduco</center>"
                });
            return false;
        }
        else return true;

    }
    $scope.serviceUrl = serviceUrl;

    function validarAcceso(pantalla) {
        if (sesionDisponible()) {
            $ionicLoading.show({
                template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
            });
            $http({
                method: "GET",
                url: $scope.serviceUrl + "/rest/Catalogos/ValidarEmpeladoRolPermisoXEmailPantalla",
                params: {
                    email: obtenerCookie("email"),
                    pantalla: pantalla
                }
            }).then(function (resultado) {
                if (!resultado.data) {
                    $ionicLoading.hide();
                    $ionicPopup
                        .alert({
                            title: "Sin permisos",
                            template: "<center>Usted no tiene permisos para acceder a esta pantalla</center>"
                        });
                    window.location = "#/contestarEncuesta";
                }
                else {
                    $ionicLoading.hide();
                    window.location = "#/" + pantalla;
                }
            },
                function () {
                    $ionicLoading.hide();
                    $ionicPopup
                        .alert({
                            title: "Error al autenticar",
                            template: "<center>Email y/o contrasena incorrectos</center>"
                        });
                });
        }
        else
            window.location = "#/login";
    }
    $scope.email = obtenerCookie("email");

    $scope.logOut = function () {
        document.cookie = "email=" + "=; Max-Age=0";
        window.location = "./index.html";
    }
    $scope.crearEncuesta = function () {
        validarAcceso("crearEncuesta");
    }
    $scope.agregarPreguntas = function () {
        validarAcceso("agregarPreguntas");
    }
    $scope.agregarRespuestas = function () {
        validarAcceso("agregarRespuestas");
    }
    $scope.contestarEncuesta = function () {
        validarAcceso("contestarEncuesta");
    }
    $scope.altaEmpleado = function () {
        validarAcceso("altaEmpleado");
    }
    $scope.generarReportes = function () {
        validarAcceso("generarReportes");
    }
});

app.controller("loginCtrl", function ($scope, $http,
    $ionicLoading, $ionicLoading, $ionicPopup, $ionicSideMenuDelegate) {

    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.hide();
        $ionicSideMenuDelegate.toggleLeft();
    };
    $ionicSideMenuDelegate.canDragContent(false)

    $scope.serviceUrl = serviceUrl;
    $scope.data = {};

    $scope.login = function () {
        $ionicLoading.show({
            template: "<p>Autenticando...</p><ion-spinner></ion-spinner>"
        });

        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/IniciarSesion",
            params: {
                email: $scope.data.email,
                contrasena: $scope.data.contrasena
            }
        }).then(function (respuesta) {
            if (respuesta.data) {
                setCookie("sesion", 1);
                setCookie("email", $scope.data.email)
                $ionicLoading.hide();
                window.location = "#/contestarEncuesta";
            }
            else {
                $ionicLoading.hide();
                $ionicPopup
                    .alert({
                        title: "Error al autenticar",
                        template: "<center>Email y/o contrasena incorrectos</center>"
                    });
            }
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error al autenticar",
                    template: "<center>Email y/o contrasena incorrectos</center>"
                });
        });
    }

    function setCookie(nombre, id) {
        document.cookie = nombre + "=" + id + "; path=/; expires=" + expiry.toGMTString();
    }
});

app.controller("crearEncuestaCtrl", function ($scope, $ionicPopup, $ionicSideMenuDelegate, $http, $ionicLoading, $ionicPopup) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.serviceUrl = serviceUrl;
    $scope.nuevaEncuesta = {};
    $scope.optionEmpresa = {};

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerEmpresas"
    }).then(function (resultado) {
        $scope.empresas = resultado.data;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en empresas",
                template: "<center>Error al obtener empresas</center>"
            });
    });

    $scope.establecerSubEmpresas = function () {
        $scope.empresasDetalles = JSON.parse($scope.optionEmpresa.empresaSeleccionada);
    }

    function limpiarVariables() {
        $scope.optionEmpresa = [];
        $scope.nuevaEncuesta = {};
    }

    $scope.CrearEncuesta = function () {
        if ($scope.optionEmpresa.empresaSeleccionada == null) {
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Por favor, elija una empresa</center>"
                });
            return;
        }
        if ($scope.nuevaEncuesta.idEmpresaDetalle == null) {
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Por favor, elija una SubEmpresa</center>"
                });
            return;
        }
        if ($scope.nuevaEncuesta.encuesta == null) {
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Por favor, escriba el nombre de la encuesta</center>"
                });
            return;
        }
        $http({
            method: "POST",
            url: $scope.serviceUrl + "/rest/Encuestas/CrearEncuesta",
            data: JSON.stringify($scope.nuevaEncuesta)
        }).then(function (resultado) {
            $ionicLoading.hide();
            if (resultado.data) {
                $ionicPopup
                    .alert({
                        title: "Transaccion de encuestas",
                        template: "<center>La encuesta ha sido creada correctamente</center>"
                    });
                limpiarVariables();
            }
            else {
                $ionicPopup
                    .alert({
                        title: "Error en encuestas",
                        template: "<center>Error al crear la encuesta</center>"
                    });
            }
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Error al crear la encuesta</center>"
                });
        });
    }
});

app.controller("agregarPreguntasCtrl", function ($scope, $ionicPopup, $ionicSideMenuDelegate, $http, $ionicLoading, $ionicPopup) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.serviceUrl = serviceUrl;
    $scope.optionSubEmpresa = {};
    $scope.optionEmpresa = {};
    $scope.optionEncuesta = {};
    $scope.optionIdioma = {};

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerEmpresas"
    }).then(function (resultado) {
        $scope.empresas = resultado.data;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en empresas",
                template: "<center>Error al obtener empresas</center>"
            });
    });

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerIdiomas"
    }).then(function (resultado) {
        $scope.idiomas = resultado.data;
    }, function () {
        $ionicPopup
            .alert({
                title: "Error en idiomas",
                template: "<center>Error al obtener idiomas</center>"
            });
    });

    $scope.establecerSubEmpresas = function () {
        $scope.empresasDetalles = JSON.parse($scope.optionEmpresa.empresaSeleccionada);
    }

    $scope.establecerEncuestas = function () {
        $scope.subEmpresaSeleccionada = $scope.optionSubEmpresa.idEmpresaDetalle;
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerEncuestasXIdEmpresaDetalle",
            params: {
                idEmpresaDetalle: $scope.subEmpresaSeleccionada
            }
        }).then(function (resultado) {
            $scope.encuestas = resultado.data;
        }, function () {
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Error al obtener encuestas</center>"
                });
        });
    }

    $scope.establecerPreguntas = function () {
        $ionicLoading.show({
            template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
        });
        if (!$scope.optionEncuesta.idEncuesta || $scope.optionEncuesta.idIdioma) {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en preguntas",
                    template: "<center>Por favor, seleccione todos los campos obligatorios</center>"
                });
            return;
        }
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerPreguntasXIdEncuestaIdIdioma",
            params: {
                idEncuesta: $scope.optionEncuesta.idEncuesta,
                idIdioma: $scope.optionIdioma.idIdioma
            }
        }).then(function (resultado) {
            console.log(resultado.data);
            $scope.habilitaBoton = true;
            $scope.preguntas = resultado.data;
            $ionicLoading.hide();
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en preguntas",
                    template: "<center>Error al obtener preguntas</center>"
                });
        });
    }

    $scope.agregarPregunta = function () {
        var nuevaPregunta = '{"idPregunta": null, "idTipo": 1 ,' + '"idEncuesta": "@idEncuesta", "pregunta": "", "idIdioma": "@idIdioma"}';
        nuevaPregunta = nuevaPregunta.replace('@idEncuesta', $scope.optionEncuesta.idEncuesta);
        nuevaPregunta = nuevaPregunta.replace('@idIdioma', $scope.optionIdioma.idIdioma),
            $scope.preguntas.push(JSON.parse(nuevaPregunta));

    }
    $scope.guardarCambios = function () {
        var confirmPopup = $ionicPopup
            .confirm({
                title: 'Confirmar',
                template: "<center>Las preguntas se guardaran permanentemente</center>"
            });
        confirmPopup
            .then(function (res) {
                if (res) {
                    $ionicLoading.show({
                        template: "<p>Guardando cambios, espere un momento por favor...</p><ion-spinner></ion-spinner>"
                    });
                    $http({
                        method: "POST",
                        url: $scope.serviceUrl + "/rest/Encuestas/GuardarPreguntas",
                        data: JSON.stringify($scope.preguntas)
                    }).then(function (resultado) {
                        $ionicLoading.hide();
                        if (resultado.data) {
                            $ionicPopup
                                .alert({
                                    title: "Transaccion de encuestas",
                                    template: "<center>Las preguntas se han guardado correctamente</center>"
                                });
                            $scope.limpiarVariables();
                        }
                        else {
                            $ionicLoading.hide();
                            $ionicPopup
                                .alert({
                                    title: "Error en encuestas",
                                    template: "<center>Error al guardar preguntas</center>"
                                });
                        }
                    }, function () {
                        $ionicLoading.hide();
                        $ionicPopup
                            .alert({
                                title: "Error en encuestas",
                                template: "<center>Error al guardar preguntas</center>"
                            });
                    });
                }
                else {
                    return;
                }

            });
    }
    $scope.limpiarVariables = function () {
        $scope.preguntas = {};
        $scope.habilitaBoton = false;
    }
    $scope.recargar = function () {
        window.location.reload();
    }
});

app.controller("agregarRespuestasCtrl", function ($scope, $ionicPopup, $ionicSideMenuDelegate, $http, $ionicLoading) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.serviceUrl = serviceUrl;
    $scope.optionSubEmpresa = {};
    $scope.optionEmpresa = {};
    $scope.optionPregunta = {};
    $scope.optionEncuesta = {};
    $scope.optionIdioma = {};

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerEmpresas"
    }).then(function (resultado) {
        $scope.empresas = resultado.data;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en empresas",
                template: "<center>Error al obtener empresas</center>"
            });
    });

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerIdiomas"
    }).then(function (resultado) {
        $scope.idiomas = resultado.data;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en idiomas",
                template: "<center>Error al obtener idiomas</center>"
            });
    });

    $scope.establecerSubEmpresas = function () {
        $scope.empresasDetalles = JSON.parse($scope.optionEmpresa.empresaSeleccionada);
    }

    $scope.establecerEncuestas = function () {
        $scope.subEmpresaSeleccionada = $scope.optionSubEmpresa.idEmpresaDetalle;
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerEncuestasXIdEmpresaDetalle",
            params: {
                idEmpresaDetalle: $scope.subEmpresaSeleccionada
            }
        }).then(function (resultado) {
            $scope.encuestas = resultado.data;
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Error al obtener encuestas</center>"
                });
        });
    }

    $scope.establecerPreguntas = function () {
        $ionicLoading.show({
            template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
        });
        if (!$scope.optionEncuesta.idEncuesta || $scope.optionEncuesta.idIdioma) {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en preguntas",
                    template: "<center>Por favor, seleccione todos los campos obligatorios</center>"
                });
            return;
        }
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerPreguntasXIdEncuestaIdIdioma",
            params: {
                idEncuesta: $scope.optionEncuesta.idEncuesta,
                idIdioma: $scope.optionIdioma.idIdioma
            }
        }).then(function (resultado) {
            $scope.preguntas = resultado.data;
            $ionicLoading.hide();
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en preguntas",
                    template: "<center>Error al obtener preguntas</center>"
                });
        });
    }

    $scope.establecerCombos = function () {
        $ionicLoading.show({
            template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
        });
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerCombosXIdPregunta",
            params: {
                idPregunta: $scope.optionPregunta.idPregunta
            }
        }).then(function (resultado) {
            $scope.habilitaBoton = true;
            $scope.combos = resultado.data;
            $ionicLoading.hide();
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en preguntas",
                    template: "<center>Error al obtener respuestas</center>"
                });
        });
    }

    $scope.agregarCombos = function () {
        var nuevaPregunta = '{"idCombo": null, "idPregunta": @idPregunta, "combo":""}';
        nuevaPregunta = nuevaPregunta.replace('@idPregunta', $scope.optionPregunta.idPregunta);
        $scope.combos.push(JSON.parse(nuevaPregunta));
    }

    $scope.guardarCambios = function () {
        var confirmPopup = $ionicPopup
            .confirm({
                title: 'Confirmar',
                template: "<center>Los combos se guardaran permanentemente</center>"
            });
        confirmPopup
            .then(function (res) {
                if (res) {
                    $ionicLoading.show({
                        template: "<p>Guardando cambios, espere un momento por favor...</p><ion-spinner></ion-spinner>"
                    });
                    $http({
                        method: "POST",
                        url: $scope.serviceUrl + "/rest/Encuestas/GuardarCombos",
                        data: JSON.stringify($scope.combos)
                    }).then(function (resultado) {
                        $ionicLoading.hide();
                        if (resultado.data) {
                            $ionicPopup
                                .alert({
                                    title: "Transaccion de encuestas",
                                    template: "<center>Los combos se han guardado correctamente</center>"
                                });
                            $scope.limpiarVariables();
                        }
                        else {
                            $ionicLoading.hide();
                            $ionicPopup
                                .alert({
                                    title: "Error en encuestas",
                                    template: "<center>Error al guardar combos</center>"
                                });
                        }
                    }, function () {
                        $ionicLoading.hide();
                        $ionicPopup
                            .alert({
                                title: "Error en encuestas",
                                template: "<center>Error al guardar combos</center>"
                            });
                    });
                }
                else {
                    return;
                }
            });
    }

    $scope.limpiarVariables = function () {
        $scope.combos = {};
        $scope.habilitaBoton = false;
    }
    $scope.recargar = function () {
        window.location.reload();
    }
});


app.controller("contestarEncuestaCtrl", function ($scope, $ionicSideMenuDelegate, $ionicScrollDelegate, $http, $ionicLoading, $ionicPopup, $window) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.serviceUrl = serviceUrl;
    $scope.idEmpresaDetalle = idEmpresaDetalleConfig;
    $scope.optionEncuesta = {};
    $scope.optionIdioma = {};
    $scope.optionPaciente = {};
    $scope.ui = {}
    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerIdiomas"
    }).then(function (resultado) {
        $scope.idiomas = resultado.data;
    }, function () {
        $ionicPopup
            .alert({
                title: "Error en idiomas",
                template: "<center>Error al obtener idiomas</center>"
            });
    });

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Encuestas/ObtenerEncuestasXIdEmpresaDetalle",
        params: {
            idEmpresaDetalle: $scope.idEmpresaDetalle
        }
    }).then(function (resultado) {
        $scope.encuestas = resultado.data;
        $scope.optionEncuesta.idEncuesta = $scope.encuestas[0].idEncuesta;
        console.log($scope.optionEncuesta.idEncuesta);
        $ionicScrollDelegate.resize()
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en encuestas",
                template: "<center>Error al obtener encuestas</center>"
            });
    });
    $scope.establecerPacientes = function () {
        $ionicLoading.show({
            template: "<p>Cargando expedientes...</p><ion-spinner></ion-spinner>"
        });
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/ObtenerPacientes"
        }).then(function (resultado) {
            $scope.pacientes = resultado.data;
            $ionicLoading.hide();
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en idiomas",
                    template: "<center>Error al obtener expedientes</center>"
                });
        });
    }

    $scope.comenzarEncuesta = function () {
        console.log("NUMEROEXPEDIENTE :", $scope.ui.numeroDeExpediente);
        $ionicLoading.show({
            template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
        });
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/ObtenerSiElExpedienteEsValido",
            params: {
                numeroDeExpediente: $scope.ui.numeroDeExpediente
            }
        }).then(function (resultado) {
            $scope.pacienteValido = resultado.data;
            $ionicLoading.hide();
            if ($scope.pacienteValido == true) {
                document.cookie = "idEncuesta=" + "=; Max-Age=0";
                document.cookie = "idIdioma=" + "=; Max-Age=0";
                document.cookie = "idPaciente=" + "=; Max-Age=0";
                setCookie("idPaciente", $scope.ui.numeroDeExpediente);
                setCookie("idEncuesta", $scope.optionEncuesta.idEncuesta);
                setCookie("idIdioma", $scope.optionIdioma.idIdioma);
                window.location = "#/preguntasCombo";
                window.location.reload();
            }
            else
                $ionicPopup
                    .alert({
                        title: "Encuestas",
                        template: "<center>El tiempo para contestar la encuesta ha terminado, usted tiene 24 horas despues de su alta o pre-alta para contestar una encuesta</center>"
                    });
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Contestar encuesta",
                    template: "<center>Error al obtener expedientes</center>"
                });
        });


    }

    function setCookie(nombre, id) {
        document.cookie = nombre + "=" + id + "; path=/; expires=" + expiry.toGMTString();
    }

});




app.controller("preguntasComboCtrl", function ($scope, $ionicSideMenuDelegate, $ionicScrollDelegate, $http, $ionicLoading, $ionicPopup, $filter) {
    $ionicLoading.show({
        template: "<p>Cargando...</p><ion-spinner></ion-spinner>"
    });
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.serviceUrl = serviceUrl;
    $scope.optionEncuesta = {};
    $scope.optionIdioma = {}
    $scope.optionEncuesta.idEncuesta = obtenerCookie("idEncuesta");
    $scope.optionIdioma.idIdioma = obtenerCookie("idIdioma");
    $scope.reproduciendo = false;

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Encuestas/ObtenerPreguntasXIdEncuestaIdIdioma",
        params: {
            idEncuesta: $scope.optionEncuesta.idEncuesta,
            idIdioma: $scope.optionIdioma.idIdioma
        }
    }).then(function (resultado) {
        $scope.preguntas = resultado.data;
        
        $ionicLoading.hide();
        $scope.getIframeSrc = function (audioname) {
            console.log(audioname);    
            return 'src/audio/' + audioname;
        };
        countpreguntas = resultado.data.length;
    }, function () {
        $ionicLoading.hide();
        $ionicPopup
            .alert({
                title: "Error en encuestas",
                template: "<center>Error al obtener encuestas</center>"
            });
    });

    $scope.getRadioButtonSelectedValue = function () {
        $ionicLoading.show({
            template: "<p>Guardando...</p><ion-spinner></ion-spinner>"
        });
        var radios = document.getElementsByTagName('input');
        var SolucionesPacienteDTO = {
            'idPaciente': obtenerCookie("idPaciente"),
            'preguntaDTOs': []
        };

        for (var i = 1; i < radios.length; i++) {
            if (radios[i].type == 'radio') {
                if (radios[i].checked) {
                    SolucionesPacienteDTO.preguntaDTOs.push({
                        "idPregunta": radios[i].name,
                        "idCombo": radios[i].value
                    });
                }
            }
        }

        for (var j = 0; j < $scope.preguntas.length; j++) {
            var itemSolucionDTO = $filter('filter')(SolucionesPacienteDTO.preguntaDTOs, { idPregunta: $scope.preguntas[j].idPregunta })[0];
            if (itemSolucionDTO == null) {
                $ionicLoading.hide();
                $ionicPopup
                    .alert({
                        title: "Error en encuestas",
                        template: "<center>Falta contestar la pregunta: " + $scope.preguntas[j].pregunta + "</center>"
                    });
                return;
            }
        }
        console.log(JSON.stringify(SolucionesPacienteDTO));

        $http({
            method: "POST",
            url: $scope.serviceUrl + "/rest/Encuestas/GuardarSoluciones",
            data: JSON.stringify(SolucionesPacienteDTO)
        }).then(function (resultado) {
            $ionicLoading.hide();
            if (resultado.data) {
                $ionicPopup
                    .alert({
                        title: "Éxito al guardar",
                        template: "<center>Gracias por participar</center>"
                    });
                $scope.limpiarVariables();
                window.location = "#/contestarEncuesta"
            }
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en encuestas",  //Error en encuestas
                    template: "<center>Error al guardar respuestas</center>" //Error al guardar respuestas
                });
            $scope.limpiarVariables();
          
        });

        $scope.limpiarVariables = function () {
            for (var i = 1; i < radios.length; i++) {
                if (radios[i].type == 'radio') {
                    if (radios[i].checked) {
                        radios[i].checked = false;
                    }
                }
            }
            $scope.serviceUrl = serviceUrl;
            $scope.optionEncuesta = {};
            $scope.optionIdioma = {}
            $scope.optionEncuesta.idEncuesta = "";
            $scope.optionIdioma.idIdioma = "";

        };
    };
    $scope.playPause = function playPause(idPregunta,idCombo) {
        $scope.pista = document.getElementById('pregunta_'+idPregunta + '_' +idCombo );
        if ($scope.pistaAux != null) {
            $scope.pistaAux.pause();
            $scope.pistaAux.currentTime = 0;
        }

        $scope.pistaAux = $scope.pista;
        if ($scope.reproduciendo) {
            $scope.reproduciendo = false;
            $scope.pista.currentTime = 0;
        } else {
            $scope.reproduciendo = true;
            $scope.pista.play();
        }
    }
});

app.controller("generarReportesCtrl", function ($scope, $ionicSideMenuDelegate, $ionicScrollDelegate, $http, $ionicLoading, $ionicPopup, $filter) {
    function obtenerCookie(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    if (obtenerCookie("sesion") == null || obtenerCookie("email") == null) {
        $ionicPopup
            .alert({
                title: "Error de inicio de sesion",
                template: "<center>La sesion caduco</center>"
            });
        window.location = "#/login";
    }
    $(function () {
        $("#datepicker,#datepicker2").datepicker({ dateFormat: 'yy-mm-dd' });
    });

    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    if (month < 10) {
        console.log(`${day}/0${month}/${year}`)
        $scope.date = `${day}-0${month}-${year}`;
    } else {
        console.log(`${day}/${month}/${year}`)
        $scope.date = `${day}/${month}/${year}`
    }

    $scope.ui = {};
    $scope.empresaDetalle = {};
    $scope.unidad = {};
    $scope.fechaInicio = "";
    $scope.fechaFin = "";
    $scope.amChartData = [];
    $scope.malTrato = {};

    $http({
        method: "GET",
        url: $scope.serviceUrl + "/rest/Catalogos/ObtenerEmpresaXId",
        params: {
            idEmpresa: idEmpresa
        }
    }).then(function (resultado) {
        $scope.empresa = resultado.data;
        $scope.empresaDetalle = $scope.empresa.catEmpresaDetalle.filter(function (x) {
            return x.catEmpresaDetallePK.idEmpresaDetalle == idEmpresaDetalleConfig
        })[0];
        $scope.establecerEncuestas();
        $scope.empresaDetalleDir = $scope.empresaDetalle.catEmpresaDetalleDir[0];
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/ObtenerUnidadTipoXId",
            params: {
                idUnidadTipo: $scope.empresaDetalle.idTipo
            }
        }).then(function (resultado) {
            $scope.unidad = resultado.data;
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en unidades",
                    template: "<center>Error al obtener unidades</center>"
                });
        });
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/ObtenerMunicipioXIdColonia",
            params: {
                idColonia: $scope.empresaDetalleDir.idColonia
            }
        }).then(function (resultado) {
            $scope.municipio = resultado.data;
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error al obtener municipio",
                    template: "<center>Error al obtener municipio</center>"
                });
        });

        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Catalogos/ObtenerAreaXId",
            params: {
                idArea: $scope.empresaDetalleDir.idArea
            }
        }).then(function (resultado) {
            $scope.area = resultado.data;
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error al obtener area",
                    template: "<center>Error al obtener area</center>"
                });
        });

    },
        function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error en empresas",
                    template: "<center>Error al obtener empresas</center>"
                });
        });

    $scope.establecerEncuestas = function () {
        $http({
            method: "GET",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerEncuestasXIdEmpresaDetalle",
            params: {
                idEmpresaDetalle: $scope.empresaDetalle.catEmpresaDetallePK.idEmpresaDetalle
            }
        }).then(function (resultado) {
            $scope.encuestas = resultado.data;
            console.log($scope.encuestas);
        }, function () {
            $ionicPopup
                .alert({
                    title: "Error en encuestas",
                    template: "<center>Error al obtener encuestas</center>"
                });
        });
    }
    $scope.openMenuLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.generarReportes = function () {
        $scope.ocultarBoton = true;
        $scope.fechaInicio = $('#datepicker').val();
        $scope.fechaFin = $('#datepicker2').val();
        $scope.ConcentradoAutomaticoRequestDTO = {};
        $scope.ConcentradoAutomaticoRequestDTO.idEncuesta = $scope.ui.encuestaSeleccionada;
        $scope.ConcentradoAutomaticoRequestDTO.fechaInicio = $scope.fechaInicio;
        $scope.ConcentradoAutomaticoRequestDTO.fechaFin = $scope.fechaFin;
        $http({
            method: "POST",
            url: $scope.serviceUrl + "/rest/Encuestas/ObtenerConcentradoAutomatico",
            data: JSON.stringify($scope.ConcentradoAutomaticoRequestDTO)
        }).then(function (resultado) {
            $scope.ConcentradoAutomatico = resultado.data;
            $scope.primerConcentrado = $scope.ConcentradoAutomatico.filter(concentrado => concentrado.idPreguntaUsuario == 3
                || concentrado.idPreguntaUsuario == 4
                || concentrado.idPreguntaUsuario == 5
                || concentrado.idPreguntaUsuario == 6);
            $scope.segundoConcentrado = $scope.ConcentradoAutomatico.filter(concentrado => concentrado.idPreguntaUsuario == 2
                || concentrado.idPreguntaUsuario == 7
                || concentrado.idPreguntaUsuario == 8
                || concentrado.idPreguntaUsuario == 9);

            $scope.malTrato = $scope.ConcentradoAutomatico.filter(concentrado => concentrado.idPreguntaUsuario == 10)[0];
            console.log($scope.malTrato);

            $scope.primerConcentrado.forEach((concentrado) => {
                $scope.auxAmChart = {};
                $scope.auxAmChart.pregunta = concentrado.idPreguntaUsuario;
                $scope.auxAmChart.satisfaccion = concentrado.porcentajeDeA;
                $scope.amChartData.push($scope.auxAmChart);

            });
            $scope.segundoConcentrado.forEach((concentrado) => {
                $scope.auxAmChart = {};
                $scope.auxAmChart.pregunta = concentrado.idPreguntaUsuario;
                $scope.auxAmChart.satisfaccion = concentrado.porcentajeDeAB;
                $scope.amChartData.push($scope.auxAmChart);

            });
            $scope.dibujarBarras();
        }, function () {
            $ionicLoading.hide();
            $ionicPopup
                .alert({
                    title: "Error al obtener ConcentradoAutomatico",
                    template: "<center>Error de comunicacion al servidor</center>"
                });
        });

    }

    $scope.dibujarBarras = function() {

        // Themes begin
        am4core.useTheme(am4themes_dataviz);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.XYChart);

        // Add data
        chart.data = $scope.amChartData;

        // Create axes

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "pregunta";
        categoryAxis.renderer.minGridDistance = 1;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100
        valueAxis.strictMinMax = false;
        valueAxis.renderer.minGridDistance = 10;
        valueAxis.adjustLabelPrecision = false;
        valueAxis.renderer.grid.template.disabled = false;
        valueAxis.renderer.labels.template.disabled = false;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "satisfaccion";
        series.dataFields.categoryX = "pregunta";
        series.name = "Satisfaccion";
        series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
        series.columns.template.fillOpacity = .8;

        var columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;
        var title = chart.titles.create();
        title.text = "2. PORCENTAJE DE SATISFACCION DE CONSULTA EXTERNA Y URGENCIAS";
        title.fontSize = 15;
        title.marginBottom = 30;

    } // end am4core.ready()
});