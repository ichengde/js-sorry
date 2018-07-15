//
// Created by liuchengde on 2018/7/15.
//

#include "router.hpp"

service serv;

void router::run(web::http::experimental::listener::http_listener &listener) {
    listener.support(web::http::methods::GET, serv.handle);
    listener.support(web::http::methods::POST, serv.stacktrace);
    listener.support(web::http::methods::OPTIONS, serv.stacktrace);
}

web::uri router::getEndPoint() {
    return web::uri_builder{}.set_scheme("http")
            .set_host("0.0.0.0").set_port(5525).set_path("/").to_uri();

}