(function() {
  function can_build_road_on_tile(tile) {
    var tile_has_road = window.tile_has_extra(tile, window.EXTRA_ROAD);
    var tile_has_river = window.tile_has_extra(tile, window.EXTRA_RIVER);
    var knows_bridge_building =
      window.player_invention_state(client.conn.playing, 8) !== window.TECH_UNKNOWN;
    return !tile_has_road && !tile_has_river && knows_bridge_building;
  }

  function can_build_rail_road_on_tile(tile) {
    var knows_rail_road =
      window.player_invention_state(client.conn.playing, 65) === window.TECH_KNOWN;
    var tile_has_road = window.tile_has_extra(tile, window.EXTRA_ROAD);
    var tile_has_rail_road = window.tile_has_extra(tile, window.EXTRA_RAIL);
    return knows_rail_road && tile_has_road && !tile_has_rail_road;
  }

  function can_mine_tile(tile) {
    var terrain_name = window.tile_terrain(tile)["name"];
    return terrain_name === "Hills" || terrain_name === "Mountains";
  }

  function can_pillage(utype, tile) {
    var is_player = !window.client_is_observer() && client.conn.playing != null;
    var is_attack_unit = utype.attack_strength > 0;
    var city = window.tile_city(tile);
    var is_in_own_city =
      city == null || window.city_owner_player_id(city) != client.conn.playing.playerno;
    return is_player && is_attack_unit && !is_in_own_city;
  }

  var icon_urls = {
    auto_settlers: "/images/orders/auto_settlers_default.png",
    build_city: "/images/orders/build_city_default.png",
    change_homecity: "/images/orders/rehome_default.png",
    disband: "/images/orders/disband_default.png",
    auto_explore: "/images/orders/auto_explore_default.png",
    forest_remove: "/images/orders/forest_remove_default.png",
    forest_add: "/images/orders/forest_add_default.png",
    fortify: "/images/orders/fortify_default.png",
    goto: "/images/orders/goto_default.png",
    irrigate: "/images/orders/irrigate_default.png",
    mine: "/images/orders/mine_default.png",
    nuke: "/images/orders/nuke.png",
    paradrop: "/images/orders/paradrop.png",
    pillage: "/images/orders/pillage.png",
    pollution: "/images/orders/pollution.png",
    railroad: "/images/orders/railroad_default.png",
    road: "/images/orders/road_default.png",
    sentry: "/images/orders/sentry_default.png",
    show_city: "/images/orders/rehome_default.png",
    transform: "/images/orders/transform_default.png",
    wait: "/images/orders/wait.png"
  };

  function UnitOrderButton(props) {
    var button = document.createElement("button");
    button.addEventListener("click", props.onClick);
    var img = document.createElement("img");
    img.src = icon_urls[props.icon];
    button.appendChild(img);
    return button;
  }

  /**
   * @param {object[]} units
   * @returns {DocumentFragment} Document fragment of buttons with possible unit actions.
   */
  window.UnitOrderButtons = function(props) {
    var buttons = document.createDocumentFragment();
    for (var i = 0, unit, utype, tile; i < props.units.length; i++) {
      unit = props.units[i];
      utype = window.unit_type(unit);
      tile = window.index_to_tile(unit.tile);
      if (tile == null) continue;
      if (utype.name === "Settlers") {
        buttons.appendChild(
          UnitOrderButton({ onClick: window.request_unit_build_city, icon: "build_city" })
        );
      }
      if (utype.name === "Engineers") {
        buttons.appendChild(
          UnitOrderButton({ onClick: window.key_unit_transform, icon: "transform" })
        );
      }
      if (utype.name === "Settlers" || utype.name === "Workers" || utype.name === "Engineers") {
        buttons.appendChild(
          UnitOrderButton({ onClick: window.key_unit_auto_settle, icon: "auto_settlers" })
        );
        if (can_build_road_on_tile(tile)) {
          buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_road, icon: "road" }));
        } else if (can_build_rail_road_on_tile(tile)) {
          buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_road, icon: "railroad" }));
        }
        if (can_mine_tile(tile)) {
          buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_mine, icon: "mine" }));
        }
        if (window.tile_has_extra(tile, window.EXTRA_POLLUTION)) {
          buttons.appendChild(
            UnitOrderButton({ onClick: window.key_unit_pollution, icon: "pollution" })
          );
        }
        if (window.tile_terrain(tile)["name"] === "Forest") {
          buttons.appendChild(
            UnitOrderButton({ onClick: window.key_unit_irrigate, icon: "forest_remove" })
          );
        } else if (!window.tile_has_extra(tile, window.EXTRA_IRRIGATION)) {
          buttons.appendChild(
            UnitOrderButton({ onClick: window.key_unit_irrigate, icon: "irrigate" })
          );
          if (!can_mine_tile(tile)) {
            buttons.appendChild(
              UnitOrderButton({ onClick: window.key_unit_mine, icon: "forest_add" })
            );
          }
        }
      } else {
        if (utype.name === "Nuclear") {
          buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_nuke, icon: "nuke" }));
        }
        if (utype.name === "Paratroopers") {
          buttons.appendChild(
            UnitOrderButton({ onClick: window.key_unit_paradrop, icon: "paradrop" })
          );
        }
        if (can_pillage(utype, tile)) {
          buttons.appendChild(
            UnitOrderButton({ onClick: window.key_unit_pillage, icon: "pillage" })
          );
        }
        buttons.appendChild(
          UnitOrderButton({ onClick: window.key_unit_auto_explore, icon: "auto_explore" })
        );
        buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_fortify, icon: "fortify" }));
      }
      buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_sentry, icon: "sentry" }));
      buttons.appendChild(UnitOrderButton({ onClick: window.key_unit_wait, icon: "wait" }));
    }
    return buttons;
  };
})();
