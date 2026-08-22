/* Minimal private portfolio analytics: no cookies, storage, or persistent IDs. */
(function(){
  'use strict';

  const script = document.currentScript;
  const workerUrl = String(script?.dataset.worker || '').replace(/\/+$/, '');
  const HEARTBEAT_MS = 15000;
  const VISIT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if(!/^https:\/\/[a-z0-9.-]+\.workers\.dev$/i.test(workerUrl)) return;

  function boot(){
    if(window.__portfolioPrivateAnalyticsStarted) return;
    window.__portfolioPrivateAnalyticsStarted = true;

    let visitId = null;
    let accumulatedVisibleMs = 0;
    let visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
    let heartbeatInFlight = false;
    let lastSentSeconds = -1;

    function closeVisibleSegment(){
      if(visibleSince === null) return;
      accumulatedVisibleMs += Math.max(0, performance.now() - visibleSince);
      visibleSince = null;
    }

    function activeSeconds(){
      const currentSegment = visibleSince === null
        ? 0
        : Math.max(0, performance.now() - visibleSince);
      return Math.floor((accumulatedVisibleMs + currentSegment) / 1000);
    }

    function heartbeatBody(){
      return JSON.stringify({
        id: visitId,
        active_seconds: activeSeconds(),
      });
    }

    function sendHeartbeat(options){
      if(!visitId) return;
      const keepalive = Boolean(options && options.keepalive);
      const force = Boolean(options && options.force);
      const seconds = activeSeconds();
      if(!force && seconds === lastSentSeconds) return;

      if(keepalive){
        fetch(`${workerUrl}/heartbeat`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store',
          keepalive: true,
          headers: {'Content-Type':'application/json'},
          body: heartbeatBody(),
        }).catch(function(){});
        return;
      }

      if(heartbeatInFlight) return;
      heartbeatInFlight = true;
      fetch(`${workerUrl}/heartbeat`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: {'Content-Type':'application/json'},
        body: heartbeatBody(),
      }).then(function(response){
        if(response.ok) lastSentSeconds = seconds;
      }).catch(function(){}).finally(function(){
        heartbeatInFlight = false;
      });
    }

    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState === 'hidden'){
        closeVisibleSegment();
        sendHeartbeat({force:true});
      } else if(visibleSince === null){
        visibleSince = performance.now();
      }
    });

    window.addEventListener('pagehide', function(){
      closeVisibleSegment();
      sendHeartbeat({keepalive:true, force:true});
    }, {capture:true});

    window.setInterval(function(){
      if(document.visibilityState === 'visible') sendHeartbeat();
    }, HEARTBEAT_MS);

    fetch(`${workerUrl}/visit`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({page:window.location.pathname || '/'}),
    }).then(function(response){
      if(!response.ok) return null;
      return response.json();
    }).then(function(data){
      if(data && VISIT_ID_PATTERN.test(String(data.id || ''))){
        visitId = data.id;
        if(activeSeconds() > 0) sendHeartbeat({force:true});
      }
    }).catch(function(){});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
