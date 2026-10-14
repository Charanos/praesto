import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { navigate } from './browser-checks.mjs';
export async function selectValue(tab,label,value) { await tab.playwright.getByRole('combobox',{name:label,exact:true}).click(); await tab.playwright.domSnapshot(); await tab.playwright.locator(`[role="option"][data-option-value="${value}"]`).click(); await tab.playwright.domSnapshot(); }

/** Run only through the documented Codex CUA API; no secondary browser driver. */
export async function reviewCatalogue(tab, viewport, directory, width) {
  await viewport.set({width,height:900});
  await tab.playwright.domSnapshot();
  await navigate(tab,'Data quality');
  await navigate(tab,'Catalogue');
  const checks=[]; const audits=[];
  const record=(name)=>checks.push(name);
  const capture=async(name)=>writeFile(`${directory}/${name}-${width}.png`,await tab.screenshot({fullPage:false}));
  const audit=async(name,dialog=false)=>{
    const scope=dialog ? tab.playwright.getByRole('dialog') : tab.playwright.locator('.app');
    await scope.getByRole('button',{name:'Run accessibility check',exact:true}).press('Enter');
    await scope.locator('[data-audit-result]').filter({hasText:'violations'}).waitFor({state:'visible',timeoutMs:20000});
    const result=JSON.parse(await scope.locator('[data-audit-result]').textContent());
    assert.equal(result.violations.length,0,`${name}: ${JSON.stringify(result.violations)}`);
    audits.push({name,...result});
  };
  assert.equal(await tab.playwright.evaluate(()=>innerWidth),width);
  assert.equal(await tab.playwright.evaluate(()=>document.documentElement.scrollWidth),width);
  record('route reflow');
  const openControls=async()=>{
    if(await tab.playwright.getByRole('button',{name:'Open catalogue controls',exact:true}).isVisible()) {
      await tab.playwright.getByRole('button',{name:'Open catalogue controls',exact:true}).click();
      await tab.playwright.domSnapshot();
    }
  };
  const closeControls=async()=>{
    if(width>1100) await tab.playwright.locator('.catalogue-extension-head').getByRole('button',{name:'Collapse catalogue controls',exact:true}).click();
    else await tab.playwright.getByRole('button',{name:/^Show .* results$/}).click();
    await tab.playwright.domSnapshot();
  };
  await openControls();
  await tab.playwright.getByRole('combobox',{name:'Stock evidence',exact:true}).waitFor({state:'visible',timeoutMs:15000});
  assert.ok(await tab.playwright.getByRole('combobox',{name:'Stock evidence',exact:true}).isVisible());
  assert.equal(await tab.playwright.getByRole('dialog').count(),width>1100?0:1);
  if(width>1100) {
    assert.equal(await tab.playwright.locator('main .catalogue-control-extension').count(),0,'Controls must live in the console, outside the page');
    assert.equal(await tab.playwright.locator('.console-control-dock > .catalogue-control-extension').count(),1);
    assert.equal(await tab.playwright.locator('.console-control-dock').evaluate(e=>e.getBoundingClientRect().top),10);
  }
  record('desktop independent extension or mobile native filter workspace');
  await capture('controls'); await audit('controls',width<=1100);
  await selectValue(tab,'Stock evidence','in');
  await tab.playwright.domSnapshot(); assert.ok((await tab.url()).includes('si='));
  await selectValue(tab,'Stock evidence','all');
  await selectValue(tab,'Pharmacy','4');
  await tab.playwright.domSnapshot(); assert.ok((await tab.url()).includes('sa=4'));
  await selectValue(tab,'Pharmacy','all');
  await selectValue(tab,'Sort results','price:asc');
  record('stock and pharmacy masks plus sort');
  await tab.playwright.getByRole('checkbox',{name:'Show analysis columns',exact:true}).check();
  await tab.playwright.getByRole('checkbox',{name:/Medicines & devices only/}).check();
  await tab.playwright.domSnapshot(); assert.ok((await tab.url()).includes('cl=1'));
  record('advanced facets and analysis column mode');
  await tab.playwright.getByRole('checkbox',{name:'Show analysis columns',exact:true}).uncheck();
  await closeControls();
  const search=tab.playwright.getByRole('textbox',{name:'Search products and ingredients'});
  await search.fill('amoxicillin'); await tab.playwright.domSnapshot();
  assert.ok((await tab.url()).includes('q=amoxicillin'));
  const region=tab.playwright.getByRole('region',{name:'Product results'});
  const first=region.locator('[data-product-index]').first();
  await first.press('ArrowDown'); await tab.playwright.domSnapshot();
  assert.ok(await tab.playwright.evaluate(()=>!!document.activeElement?.getAttribute('data-product-index')));
  assert.ok(await tab.playwright.evaluate(()=>document.querySelectorAll('[data-product-index]').length<100));
  record('ingredient search and virtualized keyboard rows');
  await capture('results');
  const sourceLabels=await tab.playwright.locator('.pharmacy-stack').allTextContents({timeoutMs:3000});
  if(width>1100) assert.ok(sourceLabels.length);
  record('source stacks retained when results have room');
  await first.click(); await tab.playwright.getByRole('dialog').waitFor({state:'visible'});
  await tab.playwright.getByRole('list',{name:'Pharmacy listings and prices',exact:true}).waitFor({state:'visible',timeoutMs:20000});
  const title=await tab.playwright.locator('#product-title').textContent();
  assert.ok(title);
  assert.ok(await tab.playwright.locator('.source-observation .pharmacy-glyph').count());
  record('named source glyphs and per-listing evidence');
  await capture('product-detail');
  await tab.playwright.getByRole('navigation',{name:'Product detail sections'}).getByRole('button',{name:'Product identity',exact:true}).click();
  assert.equal(await tab.playwright.locator('#product-identity').getAttribute('open'),'');
  await tab.playwright.getByRole('navigation',{name:'Product detail sections'}).getByRole('button',{name:'Clinical reference',exact:true}).click();
  assert.equal(await tab.playwright.evaluate(()=>document.activeElement?.id),'product-reference');
  await tab.playwright.getByRole('button',{name:'Read clinical reference',exact:true}).press('Enter');
  await tab.playwright.getByText(/Local reference preview/).waitFor({state:'visible',timeoutMs:15000});
  await tab.playwright.getByText('Mode of action',{exact:true}).press('Enter');
  await tab.playwright.domSnapshot();
  record('identity shortcut, source-gated clinical reference and disclosure');
  await capture('clinical-reference'); await audit('product and clinical reference',true);
  await tab.playwright.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).press('Escape');
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole('dialog').count(),0);
  assert.ok(await tab.playwright.evaluate(()=>!!document.activeElement?.getAttribute('data-product-index')));
  record('Escape and product focus return');
  await search.fill('NO SUCH PRODUCT 987xyz');
  await tab.playwright.getByRole('button',{name:'Reset filters',exact:true}).waitFor({state:'visible'});
  await capture('empty');
  await tab.playwright.getByRole('button',{name:'Reset filters',exact:true}).click(); await tab.playwright.domSnapshot();
  assert.ok((await tab.playwright.locator('.catalogue-result-count').textContent()).includes('43,606'));
  record('empty recovery resets complete filter state');
  await tab.playwright.getByRole('button',{name:'Matrix',exact:true}).click(); await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator('.catalogue-matrix-scroll tbody tr').count(),40);
  assert.equal(await tab.playwright.locator('.catalogue-matrix-scroll thead .pharmacy-glyph').count(),15);
  assert.ok(await tab.playwright.getByRole('region',{name:'Product by pharmacy stock matrix'}).isVisible());
  record('40-product contained matrix with 15 named source glyphs');
  await capture('matrix'); await audit('matrix');
  await tab.playwright.getByRole('button',{name:'Charts',exact:true}).click();
  await tab.playwright.getByRole('heading',{name:'Price distribution',exact:true}).waitFor({state:'visible'});
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator('.catalogue-analysis-category-list button').count(),8);
  assert.equal(await tab.playwright.locator('.catalogue-analysis-source-rows button').count(),8);
  assert.equal(await tab.playwright.locator('.catalogue-analysis-listing-only button').count(),7);
  assert.ok((await tab.playwright.locator('.catalogue-price-percentiles').textContent()).includes('1,700'));
  await tab.playwright.getByText('Read exact price counts',{exact:true}).press('Enter');
  const prices=await tab.playwright.locator('.catalogue-price-analysis tbody td').allTextContents({timeoutMs:3000});
  assert.equal(JSON.stringify(prices),JSON.stringify(['2,575','4,203','7,437','14,166','9,625','4,027','1,368']));
  record('chart grain, exact price counts, category and source partitions');
  await capture('charts'); await audit('charts');
  await tab.playwright.locator('.catalogue-analysis-category-list button').first().click();
  await tab.playwright.domSnapshot(); assert.ok((await tab.url()).includes('t='));
  record('analytics drill-down');
  await tab.playwright.getByRole('button',{name:'List',exact:true}).click();
  await openControls();
  await tab.playwright.getByRole('button',{name:'Clear all',exact:true}).click();
  await closeControls();
  await capture('list-final');
  assert.equal(await tab.playwright.evaluate(()=>document.documentElement.scrollWidth),width);
  const result={width,checks,audits,referenceProduct:title};
  await writeFile(`${directory}/review-${width}.json`,JSON.stringify(result,null,2));
  return result;
}

