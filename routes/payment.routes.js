const { Router } = require('express');
const stripe = require("stripe")(process.env.STRIPE_KEY);
const router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Pagos:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: object
 *           description: Numero identificador del concentrador
 *       example:
 *          {
 *           items:
 *           [
 *             {
 *               product: "https://juegodigitalecuador.com/files/images/productos/1647032658-amazon-gift-card-us-25.jpg",
 *               name: "Pago de 25 dolares americanos",
 *               price: 25,
 *               quantity: 1,
 *               id: 1
 *              }
 *           ]
 *          }
 */
/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Enlace para pago con stripe
 * /api/checkout:
 *   post:
 *     summary: Pasarela de pago
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pagos'
 *     responses:
 *       200:
 *         description: Concentrador Creado.
 *         content:
 *           application/json:             
 *       500:
 *         description: Some server error
 */
router.post('/', async(req, resp, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        images: [item.product]
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity

            })),
            mode: "payment",
            success_url: "http://localhost:8080/success.html",
            cancel_url: "http://localhost:8080/cancel.html"

        });
        resp.status(200).json(session)
    } catch (error) {
        next(error);
    }
})

module.exports = router;