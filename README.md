jquery.ui.collapse
==================

A jqueryui widget, it is almost a copy of jquery.ui.accordion, but can expand mutiple panels.

```
// 展开第三个panel
$(selector).collapse("option", "active", 2);
// 展开第二第四个panel
$(selector).collapse("option", "active", [1,3]);
// 展开全部panel
$(selector).collapse("option", "active", "all");

// 收缩panel把active改成deactive即可，用法类似
$(selector).collapse("option", "deactive", "all");

// isActive 判断某个pnael是否展开,参数为collapse header或者index
$(selector).collapse("isActive", 1);
$(selector).collapse("isActive", ui.header[0]);
```
