/**
 * quote-cart.js —— 询价清单（购物车）模块
 * ----------------------------------------------------------------------------
 * 为什么用 localStorage：这是一个会被用户真实部署、多页面跳转的静态站点
 * （不是聊天窗口里的一次性 artifact），"询价清单"这个功能的本质需求就是
 * "跨页面记住用户选了哪些产品，直到他填完表单提交询价"——这必须要有
 * 跨整页刷新/跳转都存在的存储，浏览器 localStorage 正是为此设计的。
 *
 * 数据形状（对应 schema.sql 里 inquiries 表还没有的"多产品"能力，
 * 这里先在前端用一个数组模拟，提交时整体打包进单条 inquiry 的 message 字段，
 * 未来正式迁移到 Next.js/真实后端时，建议给 inquiries 表加一张
 * inquiry_items(inquiry_id, product_id, quantity) 关联表来正规化存储）：
 *
 *   CartItem = {
 *     productId, slug, modelNumber, name, categoryName,
 *     imageUrl, quantity, note
 *   }
 */

const QuoteCart = (() => {
  const STORAGE_KEY = "cloudintel_quote_cart_v1";
  const listeners = new Set();

  function readRaw() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("[QuoteCart] 读取本地存储失败，已重置清单", e);
      return [];
    }
  }

  function writeRaw(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify(items);
  }

  function notify(items) {
    listeners.forEach((fn) => {
      try {
        fn(items);
      } catch (e) {
        console.error("[QuoteCart] 监听回调出错", e);
      }
    });
    // 跨标签页同步：同一浏览器打开了多个页面时，storage 事件会在"其他"标签页触发，
    // 这里手动广播一个自定义事件，方便同一页面内多个组件（页头徽标 / 清单页列表）都能感知变化。
    window.dispatchEvent(new CustomEvent("quotecart:change", { detail: { items } }));
  }

  function getItems() {
    return readRaw();
  }

  function count() {
    return readRaw().reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  function addItem(product, quantity = 1) {
    const items = readRaw();
    const existing = items.find((i) => i.productId === product.id || i.productId === product.productId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      items.push({
        productId: product.id || product.productId,
        slug: product.slug,
        modelNumber: product.modelNumber || product.model_number || "",
        name: product.name,
        categoryName: product.categoryName || product.category_name || "",
        imageUrl: product.primaryImageUrl || product.imageUrl || "assets/icons/generic-product.svg",
        quantity,
        note: ""
      });
    }
    writeRaw(items);
    return items;
  }

  function removeItem(productId) {
    const items = readRaw().filter((i) => String(i.productId) !== String(productId));
    writeRaw(items);
    return items;
  }

  function updateQuantity(productId, quantity) {
    const items = readRaw();
    const target = items.find((i) => String(i.productId) === String(productId));
    if (target) {
      target.quantity = Math.max(1, Number(quantity) || 1);
      writeRaw(items);
    }
    return items;
  }

  function updateNote(productId, note) {
    const items = readRaw();
    const target = items.find((i) => String(i.productId) === String(productId));
    if (target) {
      target.note = note;
      writeRaw(items);
    }
    return items;
  }

  function clear() {
    writeRaw([]);
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // 其他标签页改动了 localStorage 时，浏览器原生 storage 事件会通知本页面。
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      notify(readRaw());
    }
  });

  /**
   * 把购物车打包提交为一条询价（对应 policy.sql 里 anon 只能 INSERT inquiries
   * 且 status 必须是 'new' 的规则）。因为当前 schema.sql 的 inquiries 表是
   * "单产品"模型（product_id 单个字段），这里把清单里的每一项整理成文字，
   * 拼进 message 字段，同时把第一项的 product_id 作为主关联（不完美，但
   * 是在不改数据库结构前提下能想到的最合理折中——后续正式迁移时建议加
   * inquiry_items 关联表）。
   */
  async function submit(contactInfo) {
    const items = readRaw();
    const itemsSummary = items
      .map((i, idx) => `${idx + 1}. ${i.name}（型号 ${i.modelNumber || "—"}）× ${i.quantity}${i.note ? `，备注：${i.note}` : ""}`)
      .join("\n");

    const messageParts = [];
    if (itemsSummary) {
      messageParts.push(`【询价清单】\n${itemsSummary}`);
    }
    if (contactInfo.projectName) {
      messageParts.push(`【项目名称】${contactInfo.projectName}`);
    }
    if (contactInfo.message) {
      messageParts.push(`【补充说明】${contactInfo.message}`);
    }
    if (contactInfo.attachmentNote) {
      messageParts.push(`【附件说明】${contactInfo.attachmentNote}`);
    }

    const payload = {
      name: contactInfo.name,
      company: contactInfo.company,
      phone: contactInfo.phone,
      email: contactInfo.email,
      message: messageParts.join("\n\n"),
      productId: items.length ? items[0].productId : null
    };

    const result = await DataService.submitInquiry(payload);
    if (result.ok) {
      clear();
    }
    return result;
  }

  return { getItems, count, addItem, removeItem, updateQuantity, updateNote, clear, onChange, submit };
})();
