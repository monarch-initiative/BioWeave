syntax to_str = ctx => {
  let dummy = #`dummy`.get(0);
  let arg = ctx.next().value;
  return #`${dummy.fromString(arg.val())}`;
}

syntax plan = function (ctx) {
  let name = ctx.next().value;
  let bodyCtx = ctx.next().value.inner();

  let state = #`var planObj = {sources: [], targets: [], transforms: []};`;
  for (let item of bodyCtx) {
    if (item.isPunctuator() && item.val() === ';') {
      bodyCtx.next();
    }
    else if (item.isIdentifier('source')) {
      let dummy = #`dummy`.get(0);
      let qval = bodyCtx.next().value;
      let qvals = #`${dummy.fromString(qval.val())}`;
      let tval = bodyCtx.next().value;
      state = state.concat(#`
        planObj.sources.push(
          {
            name: ${qvals},
            details: ${tval}
          });
      `);
    }
    else if (item.isIdentifier('target')) {
      let dummy = #`dummy`.get(0);
      let qval = bodyCtx.next().value;
      let qvals = #`${dummy.fromString(qval.val())}`;
      let tval = bodyCtx.next().value;
      state = state.concat(#`
        planObj.targets.push(
          {
            name: ${qvals},
            details: ${tval}
          });
      `);
    }
    else {
      let val = item.val();
      if (val) {
        let dummy = #`dummy`.get(0);
        let items = #`${dummy.fromString(val)}`;

        state = state.concat(#`
          console.log('// ERROR1', ${items});
        `);
      }
      else {
        let subctx = item.inner();
        if (subctx) {
          for (let subitem of subctx) {
            let dummy = #`dummy`.get(0);
            let subitems = #`${dummy.fromString(subitem.val())}`;

            state = state.concat(#`
              console.log('// ERROR2', ${subitems});
            `);
          }
        }
        else {
          state = state.concat(#`
            console.log('// ERROR3');
          `);
        }
      }
    }
  }

  state = state.concat(#`
    console.log('sources:', planObj.sources);
    console.log('targets:', planObj.targets);
    console.log('transforms:', planObj.transforms);
    return planObj;
  `);

  return state;
}

syntax target = function (ctx) {
  return #`console.log('hello, x!')`;
}
