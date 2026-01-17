const cartService = require('../service/cartService')
const pool = require('../../config/db')
const { checkout } = require('../routes/books')

class CartController {
    async getCart(req, res) {
        const userId = req.session.userId
        const rows = await cartService.getCartItems(userid)

        const items = rows.map(r => ({
            isbn: r.isbn,
            title: r.title,
            price: Number(r.price),
            qty: Number(r.qty),
            total: Number(r.price) * Number(r.qty)
        }))
        const total = items.reduce((s, it) => s + it.total, 0)

        res.json({ items, total })
    } catch (err) {
        console.error('CartController.getCart error', err)
        res.status(500).json({ message: 'Server error loading cart.'})
    }

    async addToCart(req, res) {
        try {
            const userId = req.session.userId
            const { isbn, qty } = req.body
            const quantity = Number(qty)
            if(!isbn || !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid ISBN or quantity.'})
            }
            await cartService.addOrUpdateCartItem(userId, isbn, quantity)
            const rows = await cartService.getCartItems(userId)

            const items = rows.map(r => ({
                isbn: r.isbn,
                title: r.title,
                price: Number(r.price),
                qty: Number(r.qty),
                total: Number(r.price) * Number(r.qty)
            }))
            const total = items.reduce((s, it) => s + it.total, 0)
            res.status(200).json({ message: 'Cart updated', items, total })
        } catch (err) {
            console.error('CartController.addToCart error', err)
            res.status(500).json({ message: 'Server error updating cart'})
        }
    }

    async removeFromCart(req, res) {
        try {
            const userId = req.session.userId
            const { isbn } = req.params
            if(!isbn) return res.status(400).json({ message: 'ISBN missing '})

            await cartService.removeCartItem(userId, isbn)
            res.json({ message: 'Item removed.'})
        } catch (err) {
            console.error('CartController.removeFromCart error', err)
            res.status(500).json({ message: 'Server error removing from cart'})
        }
    }

    async checkout(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ message: 'User not logged in.' });

            const shipping = req.body.shipping || {
                address: req.session.shipAddress || '',
                city: req.session.shipCity || '',
                zip: req.session.shipZip || ''
            };

            const result = await cartService.checkoutCart(userId, shipping);

            // Se till att created är ett Date-objekt
            const createdDate = new Date(result.created);

            res.status(201).json({
                message: 'Order created',
                order: {
                    ono: result.ono,
                    created: createdDate,
                    items: result.items,
                    total: result.total,
                    deliveryDate: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                }
            });
        } catch (err) {
            console.error('CartController.checkout error', err);
            if (err.message === 'Cart is empty') {
                return res.status(400).json({ message: 'Cart is empty' });
            }
            res.status(500).json({ message: 'Server Error at checkout' });
        }
    }
}