/** Run through the Codex CUA browser runtime with its documented Playwright API. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const routeNames = {overview:'Overview',catalogue:'Catalogue',sources:'Sources',quality:'Data quality'};
export async function navigate(tab,name) {
  await tab.playwright.locator('.app[data-ready="true"]').waitFor({state:'visible',timeoutMs:20000});
  const nav=tab.playwright.getByRole('navigation',{name:'Main navigation'});
  const launcher=nav.getByRole('button',{name:'Open workspace menu',exact:true});
  if(await launcher.isVisible()) { await launcher.click(); await tab.playwright.domSnapshot(); }
  await nav.getByRole('button',{name,exact:true}).click();
  await tab.playwright.domSnapshot();
}
export async function mobileNavigation(tab,viewport,directory,width=375) {
  await viewport.set({width,height:900});
  await tab.playwright.domSnapshot();
  const nav=tab.playwright.getByRole('navigation',{name:'Main navigation'});
  const trigger=nav.getByRole('button',{name:'Open workspace menu',exact:true});
  const placement=await trigger.evaluate(element=>{const r=element.getBoundingClientRect();return {width:innerWidth,height:innerHeight,right:innerWidth-r.right,bottom:innerHeight-r.bottom,targetWidth:r.width,targetHeight:r.height,background:getComputedStyle(element).backgroundColor,color:getComputedStyle(element).color};});
  assert.equal(placement.width,width); assert.ok(placement.right>=15 && placement.right<=17); assert.ok(placement.bottom>=16); assert.equal(placement.targetWidth,48); assert.equal(placement.targetHeight,48);
  assert.ok(['rgb(23, 25, 29)','rgb(39, 43, 50)'].includes(placement.background),'Launcher stays dark in default and hover states');
  assert.equal(await nav.getByRole('button',{name:'Overview',exact:true}).count(),0);
  await writeFile(`${directory}/after-mobile-collapsed-${width}.jpg`,await tab.screenshot({fullPage:false}));
  await trigger.click(); await tab.playwright.domSnapshot();
  const current=await tab.playwright.evaluate(()=>document.activeElement?.getAttribute('aria-label'));
  assert.ok(Object.values(routeNames).includes(current));
  for(const name of Object.values(routeNames)) assert.ok(await nav.getByRole('button',{name,exact:true}).isVisible());
  await writeFile(`${directory}/after-mobile-menu-${width}.jpg`,await tab.screenshot({fullPage:false}));
  await nav.getByRole('button',{name:current,exact:true}).press('End');
  assert.equal(await tab.playwright.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Data quality');
  await nav.getByRole('button',{name:'Data quality',exact:true}).press('Home');
  assert.equal(await tab.playwright.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Overview');
  await nav.getByRole('button',{name:'Overview',exact:true}).press('ArrowDown');
  assert.equal(await tab.playwright.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Catalogue');
  await nav.getByRole('button',{name:'Catalogue',exact:true}).press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  assert.equal(await tab.playwright.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Open workspace menu');
  await trigger.click(); await tab.playwright.getByRole('textbox',{name:'Search products and ingredients'}).click();
  assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  await navigate(tab,'Sources'); assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  return {width,placement,passed:['collapsed dark surface','bottom right','hidden destinations when collapsed','current destination focus','Home/End/arrows','Escape restores focus','outside click','route selection closes']};
}
export async function sectionWorkflow(tab,viewport,directory,width) {
  await viewport.set({width,height:900});await tab.playwright.domSnapshot();
  await navigate(tab,'Sources');
  const list=tab.playwright.getByRole('list',{name:'Pharmacy sources',exact:true});
  assert.equal(await list.getByRole('listitem').count(),15);
  await tab.playwright.getByRole('button',{name:/^Reporting stock/}).click();
  assert.equal(await list.getByRole('listitem').count(),8);
  await tab.playwright.getByRole('button',{name:/^Listings only/}).click();
  assert.equal(await list.getByRole('listitem').count(),7);
  assert.equal(await list.getByText('No rate available',{exact:true}).count(),7);
  await tab.playwright.getByRole('textbox',{name:'Find a pharmacy source',exact:true}).fill('not-a-pharmacy-xyz');
  await tab.playwright.getByRole('button',{name:'Reset source filters',exact:true}).click();
  assert.equal(await list.getByRole('listitem').count(),15);
  await tab.playwright.getByRole('textbox',{name:'Find a pharmacy source',exact:true}).fill('Garnet');
  assert.equal(await list.getByRole('listitem').count(),1);
  await list.getByRole('button',{name:'Garnet Pharmacy',exact:true}).press('Enter');
  assert.equal(await list.getByRole('button',{name:'Garnet Pharmacy',exact:true}).getAttribute('aria-expanded'),'true');
  assert.ok(await list.getByText('Collection & evidence',{exact:true}).isVisible());
  assert.ok((await list.textContent()).includes('25.1'));
  await writeFile(`${directory}/after-source-detail-${width}.jpg`,await tab.screenshot({fullPage:false}));
  await list.getByRole('button',{name:'Browse Garnet Pharmacy listings',exact:true}).click();
  await tab.playwright.domSnapshot();assert.ok((await tab.url()).includes('sa=0'));
  await navigate(tab,'Data quality');
  await tab.playwright.getByRole('button',{name:'Review product matches',exact:true}).click();
  await tab.playwright.domSnapshot();assert.ok((await tab.url()).includes('rv=needs_review'));
  assert.ok((await tab.playwright.locator('.catalogue-result-count').textContent()).includes('3,398'));
  await navigate(tab,'Data quality');
  await tab.playwright.getByRole('button',{name:'Explore reference gaps',exact:true}).click();
  await tab.playwright.domSnapshot();assert.ok((await tab.url()).includes('g='));
  assert.ok((await tab.playwright.locator('.catalogue-result-count').textContent()).includes('9,041'));
  await navigate(tab,'Overview');
  await tab.playwright.locator('.calculation-sensitivity > summary').press('Enter');
  await tab.playwright.locator('.sensitivity-options > button').nth(1).press('Enter');
  await tab.playwright.domSnapshot();assert.ok((await tab.playwright.locator('.sensitivity-note').textContent()).includes('Sensitivity only'));
  await tab.playwright.locator('.sensitivity-options > button').first().press('Enter');
  assert.ok((await tab.playwright.locator('.availability-ring-value').textContent()).includes('59.7'));
  await tab.playwright.locator('.calculation-sensitivity > summary').press('Enter');
  await tab.playwright.getByRole('heading',{name:'The shape of captured prices',exact:true}).click();
  assert.ok(await tab.playwright.getByRole('heading',{name:'Confidence in the match',exact:true}).isVisible());
  await writeFile(`${directory}/after-overview-analysis-${width}.jpg`,await tab.screenshot({fullPage:false}));
  await tab.playwright.domSnapshot();
  return {width,passed:['15/8/7 source groups','source name search','source empty/reset','keyboard disclosure','listing-grain rate','source-to-catalogue','review queue count/filter','reference gap count/filter','sensitivity label and restoration']};
}
export async function captureRoutes(tab, viewport, directory, width) {
  await viewport.set({width,height:width===375?812:900});
  assert.equal(await tab.playwright.evaluate(()=>innerWidth),width,'Requested viewport must be active on the tested tab');
  const results=[];
  for(const [view,name] of Object.entries(routeNames)) {
    await navigate(tab,name);
    await tab.playwright.domSnapshot();
    const metrics=await tab.playwright.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,main:document.querySelector('main').getBoundingClientRect().width,h1:document.querySelector('h1')?.textContent,dialog:!!document.querySelector('dialog[open]')}));
    assert.equal(metrics.width,width);
    assert.equal(metrics.scroll,metrics.width,`${view} overflows at ${width}`);
    assert.ok(metrics.h1);
    await writeFile(`${directory}/after-${view}-${width}.jpg`,await tab.screenshot({fullPage:false}));
    results.push({view,...metrics});
  }
  return results;
}
export async function auditRoutes(tab,width) {
  assert.equal(await tab.playwright.evaluate(()=>innerWidth),width,'Requested viewport must be active on the tested tab');
  const results=[];
  for(const [view,name] of Object.entries(routeNames)) {
    await navigate(tab,name);
    await tab.playwright.domSnapshot();
    await tab.playwright.getByRole('button',{name:'Run accessibility check',exact:true}).click();
    await tab.playwright.locator('[data-audit-result]').filter({hasText:'violations'}).waitFor({state:'visible',timeoutMs:20000});
    results.push({view,width,...JSON.parse(await tab.playwright.locator('[data-audit-result]').textContent())});
  }
  return results;
}
export async function catalogueWorkflow(tab,viewport,directory,width) {
  const { reviewCatalogue } = await import('./catalogue-review.mjs');
  return reviewCatalogue(tab,viewport,directory,width);
}

export async function auditInteractiveStates(tab,viewport,width) {
  await viewport.set({width,height:900});
  assert.equal(await tab.playwright.evaluate(()=>innerWidth),width,'Requested viewport must be active on the tested tab');
  const results=[];
  const audit=async(state,dialog=false)=>{
    const scope=dialog?tab.playwright.getByRole('dialog'):tab.playwright.locator('.app');
    await scope.getByRole('button',{name:'Run accessibility check',exact:true}).waitFor({state:'visible'});
    await scope.getByRole('button',{name:'Run accessibility check',exact:true}).press('Enter');
    await scope.locator('[data-audit-result]').filter({hasText:'violations'}).waitFor({state:'visible',timeoutMs:20000});
    results.push({state,width,...JSON.parse(await scope.locator('[data-audit-result]').textContent())});
  };
  await navigate(tab,'Catalogue');
  if(await tab.playwright.getByRole('button',{name:'Open catalogue controls',exact:true}).isVisible()) await tab.playwright.getByRole('button',{name:'Open catalogue controls',exact:true}).click();
  await tab.playwright.domSnapshot();
  await audit('expanded filters',width<=1100);
  if(width<=1100) await tab.playwright.getByRole('button',{name:'Close filters',exact:true}).press('Escape');
  else await tab.playwright.locator('.catalogue-extension-head').getByRole('button',{name:'Collapse catalogue controls',exact:true}).click();
  await tab.playwright.getByRole('textbox',{name:'Search products and ingredients'}).fill('amoxicillin');
  await tab.playwright.getByRole('region',{name:'Product results'}).getByRole('button').first().click();
  await tab.playwright.getByRole('button',{name:'Read clinical reference',exact:true}).press('Enter');
  await tab.playwright.getByText(/Local reference preview/).waitFor({state:'visible'});
  await tab.playwright.getByText('Mode of action',{exact:true}).press('Enter');
  await tab.playwright.domSnapshot();
  await audit('clinical detail dialog',true);
  await tab.playwright.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).press('Escape');
  await tab.playwright.getByRole('button',{name:'Clear search',exact:true}).click();
  await tab.playwright.getByRole('button',{name:'Matrix',exact:true}).click();
  await tab.playwright.domSnapshot(); await audit('matrix');
  await tab.playwright.getByRole('button',{name:'Charts',exact:true}).click();
  await tab.playwright.domSnapshot(); await audit('charts');
  await tab.playwright.getByRole('textbox',{name:'Search products and ingredients'}).fill('NO SUCH PRODUCT 987xyz');
  await tab.playwright.domSnapshot(); await audit('empty results');
  await tab.playwright.getByRole('button',{name:'Reset filters',exact:true}).click();
  await navigate(tab,'Sources');
  await tab.playwright.getByRole('button',{name:'Garnet Pharmacy',exact:true}).press('Enter');
  await tab.playwright.domSnapshot(); await audit('expanded source ledger');
  await navigate(tab,'Overview');
  await tab.playwright.locator('.price-count-table > summary').press('Enter');
  await tab.playwright.locator('.calculation-sensitivity > summary').press('Enter');
  await tab.playwright.locator('.stockout-groups > summary').press('Enter');
  await audit('expanded overview analysis');
  return results;
}
